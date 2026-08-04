# ReloCompass — Database Schema

## Tables

### User
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| email | String | unique |
| name | String | nullable |
| passwordHash | String | bcrypt hash |
| role | Enum | STUDENT, JOB_SEEKER, EMPLOYER |
| image | String | nullable |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

### UserPreference (1:1 with User)
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK unique |
| destinationCountry | String | nullable |
| destinationCity | String | nullable |
| university | String | nullable |
| employer | String | nullable |
| monthlyBudget | Float | nullable |
| accommodationType | String | nullable |
| transportPreference | String | nullable |
| arrivalDate | DateTime | nullable |
| targetJob | String | nullable |
| yearsExperience | Int | nullable |
| education | String | nullable |
| languages | String | nullable |
| hasWorkVisa | Boolean | nullable |
| expectedSalary | Float | nullable |
| careerGoals | String | nullable |
| dietaryRestrictions | String | nullable |
| accessibilityNeeds | String | nullable |

### Company (1:1 with Employer User)
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK unique (employer) |
| name | String | company name |
| industry | String | nullable |
| website | String | nullable |
| description | String | nullable |
| location | String | nullable |

### Job
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| companyId | String | FK |
| title | String | |
| description | String | |
| skills | String | comma-separated |
| salaryMin | Float | nullable |
| salaryMax | Float | nullable |
| currency | String | default USD |
| location | String | |
| visaSponsorship | Boolean | default false |
| jobType | String | FULL_TIME, PART_TIME, CONTRACT |
| createdAt | DateTime | auto |

### Application (M:N User ↔ Job)
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| jobId | String | FK |
| userId | String | FK |
| status | Enum | PENDING, REVIEWED, INTERVIEW, OFFERED, REJECTED |
| coverLetter | String | nullable |
| createdAt | DateTime | auto |

### Accommodation
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| title | String | |
| type | Enum | DORM, SHARED_APARTMENT, STUDIO, HOMESTAY, HOSTEL, FAMILY_HOUSING |
| city | String | |
| country | String | |
| monthlyRent | Float | |
| currency | String | default USD |
| distanceToCenterKm | Float | nullable |
| amenities | String | comma-separated |
| safetyRating | Int | 1-5 |
| description | String | nullable |
| imageUrl | String | nullable |
| createdAt | DateTime | auto |

### Favorite (User ↔ Accommodation)
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK |
| accommodationId | String | FK |

### CommunityGroup
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| name | String | |
| type | String | STUDENT_CLUB, CULTURAL, PROFESSIONAL, MENTORSHIP, VOLUNTEER |
| city | String | nullable |
| country | String | nullable |
| description | String | |
| memberCount | Int | default 0 |

### CommunityEvent
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| title | String | |
| description | String | nullable |
| date | DateTime | |
| location | String | |
| organizer | String | nullable |

### BudgetEstimate
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| city | String | |
| country | String | |
| category | String | RENT, FOOD, TRANSPORT, UTILITIES, INSURANCE, ENTERTAINMENT, TUITION |
| monthlyCostUSD | Float | |

### TransportGuide
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| city | String | |
| country | String | |
| systemName | String | e.g. "London Underground" |
| description | String | |
| studentPassName | String | nullable |
| studentPassCost | Float | nullable |
| monthlyPassCost | Float | nullable |
| currency | String | default USD |

### ChatSession
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK |
| title | String | nullable |
| messages | Json | [{role, content, timestamp}] |
| createdAt | DateTime | auto |
| updatedAt | DateTime | auto |

### ChecklistItem
| Field | Type | Notes |
|-------|------|-------|
| id | String (cuid) | PK |
| userId | String | FK |
| task | String | |
| category | Enum | PRE_DEPARTURE, PACKING, POST_ARRIVAL |
| completed | Boolean | default false |
| createdAt | DateTime | auto |

## Relationships
- User 1:1 UserPreference
- User 1:1 Company (if EMPLOYER)
- Company 1:N Job
- Job 1:N Application
- User 1:N Application
- User 1:N Favorite
- Accommodation 1:N Favorite
- User 1:N ChatSession
- User 1:N ChecklistItem
