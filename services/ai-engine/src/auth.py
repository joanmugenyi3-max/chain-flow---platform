from __future__ import annotations

from typing import Annotated

import structlog
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPAuthorizationCredentials, HTTPBearer
from jose import ExpiredSignatureError, JWTError, jwt
from pydantic import BaseModel

from src.config import get_settings

logger = structlog.get_logger(__name__)

_bearer_scheme = HTTPBearer(auto_error=True)


class TokenPayload(BaseModel):
    """Decoded JWT payload fields used by the AI Engine."""

    sub: str  # user/service subject
    organization_id: str
    roles: list[str] = []
    exp: int | None = None


def _decode_token(token: str) -> TokenPayload:
    """Decode and validate a JWT, returning the parsed payload.

    Raises HTTPException 401 on any verification failure.
    """
    settings = get_settings()
    try:
        raw = jwt.decode(
            token,
            settings.jwt_secret,
            algorithms=[settings.jwt_algorithm],
            options={"verify_exp": True},
        )
    except ExpiredSignatureError:
        logger.warning("auth.token_expired")
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token has expired.",
            headers={"WWW-Authenticate": "Bearer"},
        )
    except JWTError as exc:
        logger.warning("auth.token_invalid", error=str(exc))
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    # Normalise claim names – some issuers use camelCase.
    organization_id = raw.get("organizationId") or raw.get("organization_id") or raw.get("org")
    if not organization_id:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Token is missing organizationId claim.",
            headers={"WWW-Authenticate": "Bearer"},
        )

    return TokenPayload(
        sub=raw.get("sub", ""),
        organization_id=str(organization_id),
        roles=raw.get("roles", []),
        exp=raw.get("exp"),
    )


async def get_current_token(
    credentials: Annotated[HTTPAuthorizationCredentials, Depends(_bearer_scheme)],
) -> TokenPayload:
    """FastAPI dependency – extracts and verifies the Bearer JWT.

    Injects a :class:`TokenPayload` into route handlers.
    """
    return _decode_token(credentials.credentials)


# Convenience alias for route signatures.
CurrentToken = Annotated[TokenPayload, Depends(get_current_token)]


def require_organization(
    token: CurrentToken,
    organization_id: str,
) -> None:
    """Raise 403 if the token does not belong to the requested organisation."""
    if token.organization_id != organization_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Access denied: organization mismatch.",
        )
