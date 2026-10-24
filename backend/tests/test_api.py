import os
os.environ["JWT_SECRET"] = "test-secret-that-is-at-least-32-characters-long"

import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

import backend.app.main as api
from backend.app.main import Base, app, get_db
api.limiter.enabled = False

test_engine = create_engine("sqlite://", connect_args={"check_same_thread": False}, poolclass=StaticPool)
TestSession = sessionmaker(bind=test_engine, autoflush=False, expire_on_commit=False)

@pytest.fixture(autouse=True)
def database():
    Base.metadata.drop_all(bind=test_engine)
    Base.metadata.create_all(bind=test_engine)
    def override_get_db():
        db = TestSession()
        try:
            yield db
        finally:
            db.close()
    app.dependency_overrides[get_db] = override_get_db
    yield
    app.dependency_overrides.clear()

client = TestClient(app)

def register(email="one@example.com"):
    response = client.post("/api/v1/auth/register", json={"email": email, "password": "correct-horse-battery-staple"})
    assert response.status_code == 201
    return {"Authorization": f"Bearer {response.json()['access_token']}"}

def test_health_and_feasibility_are_available():
    assert client.get("/health").json()["status"] == "ok"
    response = client.post("/api/v1/feasibility", json={"budget":2000000,"plot_width_ft":30,"plot_depth_ft":40,"floors":1,"bedrooms":2,"finish":"standard","location":"Coimbatore"})
    assert response.status_code == 200
    assert response.json()["rate_status"] == "third-party-market-range-not-verified"
    assert response.json()["rate_low"] == 1850
    assert response.json()["rate_per_sq_ft"] == 2225
    assert response.json()["rate_high"] == 2600
    assert response.json()["area_low_sq_ft"] <= response.json()["area_high_sq_ft"]
    assert response.json()["estimated_total"] == pytest.approx(2000000)

def test_auth_and_duplicate_email():
    register()
    assert client.post("/api/v1/auth/register", json={"email":"ONE@example.com","password":"correct-horse-battery-staple"}).status_code == 409
    assert client.post("/api/v1/auth/login", json={"email":"one@example.com","password":"incorrect-password"}).status_code == 401

def test_project_crud_and_versioned_snapshots():
    headers = register()
    created = client.post("/api/v1/projects", headers=headers, json={"title":"First home","payload":{"budget":2000000,"plan":{"version":1}}})
    assert created.status_code == 201
    project_id = created.json()["id"]
    snap = client.post(f"/api/v1/projects/{project_id}/snapshots", headers=headers, json={"budget":2500000})
    assert [s["version"] for s in snap.json()["snapshots"]] == [1, 2]
    renamed = client.patch(f"/api/v1/projects/{project_id}", headers=headers, json={"title":"New name"})
    assert renamed.json()["title"] == "New name"
    duplicated = client.post(f"/api/v1/projects/{project_id}/duplicate", headers=headers)
    assert duplicated.status_code == 201
    assert duplicated.json()["title"] == "New name copy"
    assert len(client.get("/api/v1/projects", headers=headers).json()) == 2
    assert client.delete(f"/api/v1/projects/{project_id}", headers=headers).status_code == 204

def test_projects_require_auth_and_are_owner_scoped():
    assert client.get("/api/v1/projects").status_code == 401
    owner_headers = register("owner@example.com")
    project = client.post("/api/v1/projects", headers=owner_headers, json={"title":"Private","payload":{}}).json()
    other_headers = register("other@example.com")
    assert client.get(f"/api/v1/projects/{project['id']}", headers=other_headers).status_code == 404
    assert client.delete(f"/api/v1/projects/{project['id']}", headers=other_headers).status_code == 404

def test_professional_review_request_is_owner_scoped_and_has_reviewer_workflow(monkeypatch):
    owner_headers = register("review-owner@example.com")
    created = client.post("/api/v1/projects", headers=owner_headers, json={"title":"Review me","payload":{"plan":{"schemaVersion":1}}})
    project_id = created.json()["id"]

    requested = client.post(
        f"/api/v1/projects/{project_id}/review-requests",
        headers=owner_headers,
        json={"note":"Please review circulation and room proportions."},
    )
    assert requested.status_code == 201
    review = requested.json()
    assert review["status"] == "requested"
    assert review["project_id"] == project_id

    other_headers = register("review-other@example.com")
    assert client.post(
        f"/api/v1/projects/{project_id}/review-requests",
        headers=other_headers,
        json={"note":"Should not be allowed"},
    ).status_code == 404
    assert client.get("/api/v1/review-requests", headers=other_headers).json() == []

    assert client.patch(
        f"/api/v1/review-requests/{review['id']}",
        headers={"X-Review-Admin-Token":"wrong"},
        json={"status":"completed","reviewer_note":"Reviewed"},
    ).status_code == 401

    monkeypatch.setattr(api, "REVIEW_ADMIN_TOKEN", "test-review-admin-token")
    decided = client.patch(
        f"/api/v1/review-requests/{review['id']}",
        headers={"X-Review-Admin-Token":"test-review-admin-token"},
        json={"status":"needs_changes","reviewer_note":"Please ask a licensed professional to review the stair and ventilation provisions."},
    )
    assert decided.status_code == 200
    assert decided.json()["status"] == "needs_changes"
    assert "licensed professional" in decided.json()["reviewer_note"]
    assert client.get("/api/v1/review-requests", headers=owner_headers).json()[0]["status"] == "needs_changes"

def test_account_deletion_requires_password_and_removes_owned_projects():
    headers = register("delete-account@example.com")
    project = client.post("/api/v1/projects", headers=headers, json={"title":"Delete me","payload":{}}).json()
    bad = client.request("DELETE", "/api/v1/account", headers=headers, json={"password":"not-the-password"})
    assert bad.status_code == 401
    good = client.request("DELETE", "/api/v1/account", headers=headers, json={"password":"correct-horse-battery-staple"})
    assert good.status_code == 204
    assert client.get(f"/api/v1/projects/{project['id']}", headers=headers).status_code == 401
