from __future__ import annotations

import os
import json
import secrets
from pathlib import Path
from datetime import datetime, timedelta, timezone
from typing import Any, Generator
from uuid import uuid4

import jwt
from fastapi import Depends, FastAPI, Header, HTTPException, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from argon2 import PasswordHasher
from argon2.exceptions import VerificationError, VerifyMismatchError
from pydantic import BaseModel, ConfigDict, Field
from sqlalchemy import DateTime, ForeignKey, Integer, String, Text, UniqueConstraint, create_engine, select
from sqlalchemy.orm import DeclarativeBase, Mapped, Session, mapped_column, relationship, sessionmaker
from slowapi import Limiter, _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from slowapi.util import get_remote_address

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./juno_architects.db")
JWT_SECRET = os.getenv("JWT_SECRET", "")
REVIEW_ADMIN_TOKEN = os.getenv("REVIEW_ADMIN_TOKEN", "")
JWT_ALGORITHM = "HS256"
TOKEN_MINUTES = 60
RATE_CONFIGURATION = json.loads((Path(__file__).resolve().parents[2] / "shared" / "rates.v1.json").read_text(encoding="utf-8"))
password_hash = PasswordHasher()
bearer = HTTPBearer(auto_error=False)


def build_engine(url: str):
    options: dict[str, Any] = {"pool_pre_ping": True}
    if url.startswith("sqlite"):
        from sqlalchemy.pool import StaticPool
        options["connect_args"] = {"check_same_thread": False}
        if url in ("sqlite://", "sqlite:///:memory:"):
            options["poolclass"] = StaticPool
    return create_engine(url, **options)


engine = build_engine(DATABASE_URL)
SessionLocal = sessionmaker(bind=engine, autoflush=False, expire_on_commit=False)


class Base(DeclarativeBase):
    pass


class User(Base):
    __tablename__ = "users"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    email: Mapped[str] = mapped_column(String(320), unique=True, index=True)
    password_digest: Mapped[str] = mapped_column(String(512))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    projects: Mapped[list["Project"]] = relationship(back_populates="owner", cascade="all, delete-orphan")


class Project(Base):
    __tablename__ = "projects"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    title: Mapped[str] = mapped_column(String(160))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    owner: Mapped[User] = relationship(back_populates="projects")
    snapshots: Mapped[list["ProjectSnapshot"]] = relationship(back_populates="project", cascade="all, delete-orphan", order_by="ProjectSnapshot.version")


class ProfessionalReviewRequest(Base):
    __tablename__ = "professional_review_requests"
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    owner_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), index=True)
    note: Mapped[str] = mapped_column(Text, default="")
    status: Mapped[str] = mapped_column(String(32), default="requested")
    reviewer_note: Mapped[str] = mapped_column(Text, default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))


class ProjectSnapshot(Base):
    __tablename__ = "project_snapshots"
    __table_args__ = (UniqueConstraint("project_id", "version", name="uq_project_snapshot_version"),)
    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=lambda: str(uuid4()))
    project_id: Mapped[str] = mapped_column(ForeignKey("projects.id", ondelete="CASCADE"), index=True)
    version: Mapped[int] = mapped_column(Integer)
    payload_json: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=lambda: datetime.now(timezone.utc))
    project: Mapped[Project] = relationship(back_populates="snapshots")


def get_db() -> Generator[Session, None, None]:
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()


class RegisterInput(BaseModel):
    email: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=12, max_length=128)


class LoginInput(BaseModel):
    email: str = Field(min_length=5, max_length=320)
    password: str = Field(min_length=1, max_length=128)


class TokenOutput(BaseModel):
    access_token: str
    token_type: str = "bearer"
    expires_in: int = TOKEN_MINUTES * 60


class FeasibilityInput(BaseModel):
    budget: float = Field(gt=0, le=10_000_000_000)
    plot_width_ft: float = Field(gt=0, le=1000)
    plot_depth_ft: float = Field(gt=0, le=1000)
    floors: int = Field(ge=1, le=3)
    bedrooms: int = Field(ge=1, le=8)
    finish: str = Field(pattern="^(basic|standard|premium)$")
    location: str = Field(min_length=2, max_length=160)


class ProjectInput(BaseModel):
    title: str = Field(min_length=1, max_length=160)
    payload: dict[str, Any]


class ProjectRename(BaseModel):
    title: str = Field(min_length=1, max_length=160)


class ReviewRequestInput(BaseModel):
    note: str = Field(default="", max_length=2000)


class ReviewDecision(BaseModel):
    status: str = Field(pattern="^(accepted|needs_changes|completed|declined)$")
    reviewer_note: str = Field(default="", max_length=2000)


class ProjectOutput(BaseModel):
    id: str
    title: str
    created_at: datetime
    updated_at: datetime
    snapshots: list[dict[str, Any]]
    model_config = ConfigDict(from_attributes=True)


app = FastAPI(title="Juno Architects API", version="0.1.0", description="Feasibility and private concept-project API.")
limiter = Limiter(key_func=get_remote_address, default_limits=["120/minute"])
app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)
allowed_origins = [origin.strip() for origin in os.getenv("FRONTEND_ORIGINS", "http://localhost:5173").split(",") if origin.strip()]
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins,
    allow_credentials=False,
    allow_methods=["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allow_headers=["Authorization", "Content-Type"],
)


@app.on_event("startup")
def startup() -> None:
    # Alembic owns production schema changes. This fallback keeps local first-run simple.
    if os.getenv("JUNO_AUTO_CREATE_TABLES", "false").lower() == "true":
        Base.metadata.create_all(bind=engine)


def issue_token(user: User) -> str:
    if len(JWT_SECRET) < 32:
        raise HTTPException(status_code=503, detail="Authentication is not configured. Set a random JWT_SECRET of at least 32 characters.")
    now = datetime.now(timezone.utc)
    return jwt.encode({"sub": user.id, "iat": now, "exp": now + timedelta(minutes=TOKEN_MINUTES)}, JWT_SECRET, algorithm=JWT_ALGORITHM)


def current_user(credentials: HTTPAuthorizationCredentials | None = Depends(bearer), db: Session = Depends(get_db)) -> User:
    if credentials is None:
        raise HTTPException(status_code=401, detail="Bearer token required.", headers={"WWW-Authenticate": "Bearer"})
    if len(JWT_SECRET) < 32:
        raise HTTPException(status_code=503, detail="Authentication is not configured.")
    try:
        payload = jwt.decode(credentials.credentials, JWT_SECRET, algorithms=[JWT_ALGORITHM], options={"require": ["sub", "exp"]})
        user = db.get(User, payload["sub"])
    except (jwt.InvalidTokenError, KeyError, TypeError):
        user = None
    if user is None:
        raise HTTPException(status_code=401, detail="Invalid or expired token.", headers={"WWW-Authenticate": "Bearer"})
    return user


def owned_project(db: Session, project_id: str, user: User) -> Project:
    project = db.scalar(select(Project).where(Project.id == project_id, Project.owner_id == user.id))
    if project is None:
        # A uniform 404 avoids revealing another user's project IDs.
        raise HTTPException(status_code=404, detail="Project not found.")
    return project


def project_json(project: Project) -> dict[str, Any]:
    import json
    return {"id": project.id, "title": project.title, "created_at": project.created_at, "updated_at": project.updated_at,
            "snapshots": [{"version": snap.version, "created_at": snap.created_at, "payload": json.loads(snap.payload_json)} for snap in project.snapshots]}


@app.get("/health")
def health() -> dict[str, str]:
    return {"status": "ok", "service": "juno-architects-api"}


@app.post("/api/v1/auth/register", response_model=TokenOutput, status_code=201)
@limiter.limit("5/minute")
def register(request: Request, data: RegisterInput, db: Session = Depends(get_db)) -> TokenOutput:
    if len(JWT_SECRET) < 32:
        raise HTTPException(status_code=503, detail="Authentication is not configured.")
    email = data.email.strip().lower()
    if "@" not in email or email.startswith("@") or email.endswith("@"):
        raise HTTPException(status_code=422, detail="Enter a valid email address.")
    if db.scalar(select(User).where(User.email == email)):
        raise HTTPException(status_code=409, detail="An account with this email already exists.")
    user = User(email=email, password_digest=password_hash.hash(data.password))
    db.add(user)
    db.commit()
    db.refresh(user)
    return TokenOutput(access_token=issue_token(user))


@app.post("/api/v1/auth/login", response_model=TokenOutput)
@limiter.limit("10/minute")
def login(request: Request, data: LoginInput, db: Session = Depends(get_db)) -> TokenOutput:
    email = data.email.strip().lower()
    user = db.scalar(select(User).where(User.email == email))
    valid_password = False
    if user is not None:
        try:
            valid_password = password_hash.verify(user.password_digest, data.password)
        except (VerifyMismatchError, VerificationError):
            valid_password = False
    if not valid_password:
        raise HTTPException(status_code=401, detail="Email or password is incorrect.")
    return TokenOutput(access_token=issue_token(user))


@app.post("/api/v1/feasibility")
def feasibility(data: FeasibilityInput) -> dict[str, Any]:
    selected_rate = RATE_CONFIGURATION["rates"][data.finish]
    rate_low = selected_rate["low"]
    rate_high = selected_rate["high"]
    rate = selected_rate["representative"]
    base = data.budget / 1.21
    site = base * 0.05
    professional = base * 0.05
    contingency = (base + site + professional) * 0.10
    total = base + site + professional + contingency
    plot_area = data.plot_width_ft * data.plot_depth_ft
    gross_plot_capacity = plot_area * data.floors
    area_low = min(base / rate_high, gross_plot_capacity)
    area_high = min(base / rate_low, gross_plot_capacity)
    return {
        "plot_area_sq_ft": plot_area, "rate_per_sq_ft": rate, "rate_low": rate_low, "rate_high": rate_high, "rate_version": RATE_CONFIGURATION["configuration_id"],
        "rate_status": RATE_CONFIGURATION["source_status"], "region": RATE_CONFIGURATION["region"],
        "configuration_date": RATE_CONFIGURATION["configuration_date"], "benchmark_references": RATE_CONFIGURATION["benchmark_references"], "area_low_sq_ft": area_low,
        "area_high_sq_ft": min(area_high, plot_area * data.floors), "base_construction": base,
        "site_allowance": site, "professional_allowance": professional, "contingency": contingency,
        "estimated_total": total, "assumptions": ["Land excluded", "Third-party published market ranges; not independently verified contractor quotes", "Site-specific rules and professional review required"],
    }


@app.post("/api/v1/projects/{project_id}/review-requests", status_code=201)
def request_professional_review(project_id: str, data: ReviewRequestInput, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    owned_project(db, project_id, user)
    review = ProfessionalReviewRequest(project_id=project_id, owner_id=user.id, note=data.note.strip())
    db.add(review)
    db.commit()
    db.refresh(review)
    return review_json(review)


@app.get("/api/v1/review-requests")
def list_my_review_requests(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    reviews = db.scalars(select(ProfessionalReviewRequest).where(ProfessionalReviewRequest.owner_id == user.id).order_by(ProfessionalReviewRequest.created_at.desc())).all()
    return [review_json(review) for review in reviews]


@app.patch("/api/v1/review-requests/{review_id}")
def decide_professional_review(review_id: str, data: ReviewDecision, x_review_admin_token: str | None = Header(default=None), db: Session = Depends(get_db)) -> dict[str, Any]:
    # Separate secret for reviewer operations; never reuse the public JWT secret.
    if not REVIEW_ADMIN_TOKEN or not x_review_admin_token or not secrets.compare_digest(x_review_admin_token, REVIEW_ADMIN_TOKEN):
        raise HTTPException(status_code=401, detail="Reviewer authorization required.")
    review = db.get(ProfessionalReviewRequest, review_id)
    if review is None:
        raise HTTPException(status_code=404, detail="Review request not found.")
    review.status = data.status
    review.reviewer_note = data.reviewer_note.strip()
    review.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(review)
    return review_json(review)


def review_json(review: ProfessionalReviewRequest) -> dict[str, Any]:
    return {"id": review.id, "project_id": review.project_id, "status": review.status, "note": review.note,
            "reviewer_note": review.reviewer_note, "created_at": review.created_at, "updated_at": review.updated_at}


@app.get("/api/v1/projects")
def list_projects(user: User = Depends(current_user), db: Session = Depends(get_db)) -> list[dict[str, Any]]:
    projects = db.scalars(select(Project).where(Project.owner_id == user.id).order_by(Project.updated_at.desc())).all()
    return [project_json(p) for p in projects]


@app.post("/api/v1/projects", status_code=201)
def create_project(data: ProjectInput, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    import json
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Project title cannot be blank.")
    project = Project(owner_id=user.id, title=title)
    project.snapshots.append(ProjectSnapshot(version=1, payload_json=json.dumps(data.payload, separators=(",", ":"), allow_nan=False)))
    db.add(project)
    db.commit()
    db.refresh(project)
    return project_json(project)


@app.get("/api/v1/projects/{project_id}")
def get_project(project_id: str, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    return project_json(owned_project(db, project_id, user))


@app.patch("/api/v1/projects/{project_id}")
def rename_project(project_id: str, data: ProjectRename, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    project = owned_project(db, project_id, user)
    title = data.title.strip()
    if not title:
        raise HTTPException(status_code=422, detail="Project title cannot be blank.")
    project.title = title
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    return project_json(project)


@app.post("/api/v1/projects/{project_id}/duplicate", status_code=201)
def duplicate_project(project_id: str, user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    import json
    source = owned_project(db, project_id, user)
    copy = Project(owner_id=user.id, title=f"{source.title} copy")
    for snap in source.snapshots:
        copy.snapshots.append(ProjectSnapshot(version=snap.version, payload_json=snap.payload_json))
    db.add(copy)
    db.commit()
    db.refresh(copy)
    return project_json(copy)


@app.post("/api/v1/projects/{project_id}/snapshots", status_code=201)
def create_snapshot(project_id: str, payload: dict[str, Any], user: User = Depends(current_user), db: Session = Depends(get_db)) -> dict[str, Any]:
    import json
    project = owned_project(db, project_id, user)
    version = max((s.version for s in project.snapshots), default=0) + 1
    project.snapshots.append(ProjectSnapshot(version=version, payload_json=json.dumps(payload, separators=(",", ":"), allow_nan=False)))
    project.updated_at = datetime.now(timezone.utc)
    db.commit()
    db.refresh(project)
    return project_json(project)


@app.delete("/api/v1/projects/{project_id}", status_code=204)
def delete_project(project_id: str, user: User = Depends(current_user), db: Session = Depends(get_db)) -> None:
    project = owned_project(db, project_id, user)
    db.delete(project)
    db.commit()
