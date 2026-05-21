"""Basic smoke tests for AI Engine endpoints."""
import pytest
from httpx import AsyncClient, ASGITransport
from app.main import app


@pytest.fixture
def api_key():
    return "dev-key-change-in-production"


@pytest.mark.asyncio
async def test_health_endpoint(api_key):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/")
    assert resp.status_code == 200
    data = resp.json()
    assert "version" in data


@pytest.mark.asyncio
async def test_model_status_requires_auth():
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get("/api/ai/model-status")
    assert resp.status_code == 403


@pytest.mark.asyncio
async def test_model_status_with_auth(api_key):
    transport = ASGITransport(app=app)
    async with AsyncClient(transport=transport, base_url="http://test") as client:
        resp = await client.get(
            "/api/ai/model-status",
            headers={"X-API-Key": api_key},
        )
    assert resp.status_code == 200
    data = resp.json()
    assert "models" in data
