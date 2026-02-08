from pydantic import BaseModel, Field, BeforeValidator
from typing import Optional, List, Literal, Annotated
from datetime import datetime

# Helper for handling ObjectId
PyObjectId = Annotated[str, BeforeValidator(str)]

class TaskBase(BaseModel):
    title: str
    description: Optional[str] = None
    category: str = "work" # Relaxed from Literal to allow dynamic tags
    start_time: datetime
    duration: int  # minutes
    is_completed: bool = False
    is_template: bool = False
    estimated_time: Optional[int] = None # minutes
    color: str = "#3b82f6" # Added color support

class TaskCreate(TaskBase):
    pass

class TaskUpdate(BaseModel):
    title: Optional[str] = None
    description: Optional[str] = None
    category: Optional[str] = None
    start_time: Optional[datetime] = None
    duration: Optional[int] = None
    is_completed: Optional[bool] = None
    is_template: Optional[bool] = None
    color: Optional[str] = None

class Task(TaskBase):
    id: Optional[PyObjectId] = Field(alias="_id", default=None)
    end_time: datetime
    created_at: datetime = Field(default_factory=datetime.utcnow)
    updated_at: datetime = Field(default_factory=datetime.utcnow)
    
    # Phase 3 prep
    embedding: Optional[List[float]] = None
    productivity_score: Optional[int] = None

    class Config:
        populate_by_name = True
        json_encoders = {datetime: lambda v: v.isoformat()}
