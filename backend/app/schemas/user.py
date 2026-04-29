from typing import Optional, List
from pydantic import BaseModel, ConfigDict, EmailStr, Field

class UserBase(BaseModel):
    email: Optional[EmailStr] = None
    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    is_screen_always_on: bool = True
    calorie_goal: Optional[int] = 2000
    dietary_restrictions: List[str] = Field(default_factory=list)

class UserCreate(UserBase):
    email: EmailStr
    password: str

class UserUpdate(UserBase):
    password: Optional[str] = None


class UserSelfUpdate(BaseModel):
    """Partial update for the authenticated user (no email/password here)."""

    full_name: Optional[str] = None
    bio: Optional[str] = None
    profile_image_url: Optional[str] = None
    calorie_goal: Optional[int] = None
    dietary_restrictions: Optional[List[str]] = None
    is_screen_always_on: Optional[bool] = None

class UserInDBBase(UserBase):
    id: Optional[int] = None

    model_config = ConfigDict(from_attributes=True)

class User(UserInDBBase):
    pass

class UserInDB(UserInDBBase):
    hashed_password: str
