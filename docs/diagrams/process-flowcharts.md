# Process Flowcharts

## Overview
This document contains flowcharts that illustrate the key processes within the SetAi Bot system, from user interaction to command execution and system coordination.

## Command Processing Workflow

### Main Command Flow
```mermaid
flowchart TD
    A[Discord User Sends Message] --> B{Is Message a Bot Command?}
    B -->|No| C[Ignore Message]
    B -->|Yes| D[Parse Command Structure]
    
    D --> E{Rate Limit Check}
    E -->|Exceeded| F[Send Rate Limit Message]
    E -->|OK| G[Extract Command Type & Parameters]
    
    G --> H{User Permission Check}
    H -->|Denied| I[Send Permission Error]
    H -->|Granted| J{Bot Permission Check}
    
    J -->|Insufficient| K[Send Bot Permission Error]
    J -->|Sufficient| L{Is Natural Language Command?}
    
    L -->|Yes| M[Send to AI Processor]
    L -->|No| N[Use Rule-Based Parser]
    
    M --> O{AI Service Available?}
    O -->|No| P[Fallback to Rule-Based]
    O -->|Yes| Q[AI Interprets Command]
    
    P --> R[Parse with Rules]
    Q --> S{AI Response Valid?}
    S -->|No| T[Use Fallback Parser]
    S -->|Yes| U[Extract Structured Command]
    
    R --> V[Create Command Object]
    T --> V
    U --> V
    
    V --> W{Load Template?}
    W -->|Yes| X[Apply Configuration Template]
    W -->|No| Y[Use Direct Parameters]
    
    X --> Z[Validate Final Configuration]
    Y --> Z
    
    Z --> AA{Configuration Valid?}
    AA -->|No| BB[Send Validation Error]
    AA -->|Yes| CC[Execute Discord Operations]
    
    CC --> DD{Execution Successful?}
    DD -->|No| EE[Handle Error & Notify User]
    DD -->|Yes| FF[Update Cache]
    
    FF --> GG[Log Action to Database]
    GG --> HH[Send Success Confirmation]
    
    F --> END[End]
    I --> END
    K --> END
    BB --> END
    EE --> END
    HH --> END
    C --> END
    
    style A fill:#e1f5fe
    style HH fill:#c8e6c9
    style F fill:#ffcdd2
    style I fill:#ffcdd2
    style K fill:#ffcdd2
    style BB fill:#ffcdd2
    style EE fill:#ffcdd2
```

### AI Processing Subflow
```mermaid
flowchart TD
    A[Natural Language Command] --> B[Build AI Prompt with Context]
    B --> C[Check Response Cache]
    C --> D{Cache Hit?}
    D -->|Yes| E[Return Cached Response]
    D -->|No| F{AI Service Health Check}
    
    F -->|Unhealthy| G[Circuit Breaker Open]
    F -->|Healthy| H[Send Request to AI Service]
    
    G --> I[Return Fallback Response]
    H --> J{Request Timeout?}
    
    J -->|Yes| K[Log Timeout Error]
    J -->|No| L[Receive AI Response]
    
    K --> M{Retry Attempt?}
    M -->|Yes| N[Exponential Backoff]
    M -->|No| O[Use Fallback Parser]
    
    N --> H
    L --> P[Validate Response Format]
    
    P --> Q{Valid JSON Structure?}
    Q -->|No| R[Log Validation Error]
    Q -->|Yes| S[Parse Command Components]
    
    R --> T{Safety Check Passed?}
    S --> T
    T -->|No| U[Block Unsafe Command]
    T -->|Yes| V[Cache Response]
    
    V --> W[Return Structured Command]
    
    E --> W
    I --> W
    O --> W
    U --> X[Return Error Response]
    
    style A fill:#e1f5fe
    style W fill:#c8e6c9
    style X fill:#ffcdd2
    style I fill:#fff3e0
    style O fill:#fff3e0
```

### Permission Validation Flow
```mermaid
flowchart TD
    A[Permission Check Request] --> B[Load User Discord Permissions]
    B --> C[Load Bot Discord Permissions]
    C --> D[Check Cache for Server Rules]
    
    D --> E{Server Rules Cached?}
    E -->|No| F[Load from Database]
    E -->|Yes| G[Apply Permission Rules]
    
    F --> H[Cache Server Rules]
    H --> G
    
    G --> I{User Has Required Permission?}
    I -->|No| J[Check Role Inheritance]
    I -->|Yes| K{Bot Has Required Permission?}
    
    J --> L{Inherited Permission Found?}
    L -->|No| M[Permission Denied]
    L -->|Yes| K
    
    K -->|No| N[Bot Permission Insufficient]
    K -->|Yes| O{Server-Specific Rules?}
    
    O -->|Yes| P[Apply Server Rules]
    O -->|No| Q[Permission Granted]
    
    P --> R{Rules Allow Action?}
    R -->|No| S[Server Rule Violation]
    R -->|Yes| T[Log Permission Grant]
    
    T --> Q
    
    M --> U[Log Permission Denial]
    N --> V[Log Bot Permission Issue]
    S --> W[Log Rule Violation]
    
    U --> X[Return Denial Response]
    V --> Y[Return Bot Error Response]
    W --> Z[Return Rule Error Response]
    Q --> AA[Return Success Response]
    
    style A fill:#e1f5fe
    style AA fill:#c8e6c9
    style X fill:#ffcdd2
    style Y fill:#ffcdd2
    style Z fill:#ffcdd2
```

## System Communication Flows

### Bot-API-Redis-MySQL Coordination
```mermaid
flowchart LR
    subgraph "Discord Bot Instance 1"
        B1[Bot Process 1]
    end
    
    subgraph "Discord Bot Instance 2" 
        B2[Bot Process 2]
    end
    
    subgraph "API Service"
        API[REST API]
        CTL[Control Logic]
        MON[Monitoring]
    end
    
    subgraph "Redis Cluster"
        RC[Redis Cache]
        PS[Pub/Sub]
    end
    
    subgraph "MySQL Cluster"
        MW[MySQL Write]
        MR[MySQL Read Replica]
    end
    
    B1 <-->|Command Status Updates| API
    B2 <-->|Configuration Requests| API
    
    B1 <-->|Cache Operations| RC
    B2 <-->|Cache Operations| RC
    
    B1 <-->|Event Broadcasting| PS
    B2 <-->|Event Listening| PS
    
    API <-->|Session Management| RC
    API <-->|Real-time Updates| PS
    
    B1 -->|Write Audit Logs| MW
    B2 -->|Write Audit Logs| MW
    API -->|Write Analytics| MW
    
    B1 -->|Read Configuration| MR
    B2 -->|Read Templates| MR
    API -->|Read Metrics| MR
    
    MW -.->|Replication| MR
    
    style B1 fill:#e3f2fd
    style B2 fill:#e3f2fd
    style API fill:#e8f5e8
    style RC fill:#fff3e0
    style PS fill:#fff3e0
    style MW fill:#f3e5f5
    style MR fill:#f3e5f5
```

### Error Handling and Recovery Flow
```mermaid
flowchart TD
    A[Error Detected] --> B[Categorize Error Type]
    B --> C{Error Type}
    
    C -->|Transient| D[Apply Retry Strategy]
    C -->|Configuration| E[Validate Configuration]
    C -->|Permission| F[Check Permission State]
    C -->|System| G[Check System Health]
    
    D --> H{Retry Successful?}
    H -->|Yes| I[Continue Operation]
    H -->|No| J{Max Retries Reached?}
    
    J -->|No| K[Exponential Backoff]
    J -->|Yes| L[Escalate Error]
    
    K --> D
    
    E --> M{Config Fixable?}
    M -->|Yes| N[Apply Fix]
    M -->|No| O[Request Admin Action]
    
    F --> P{Permission Recoverable?}
    P -->|Yes| Q[Request Permission Grant]
    P -->|No| R[Notify Permission Issue]
    
    G --> S{Service Recoverable?}
    S -->|Yes| T[Trigger Circuit Breaker]
    S -->|No| U[Engage Disaster Recovery]
    
    N --> V[Retry Original Operation]
    Q --> V
    T --> W[Wait for Service Recovery]
    
    L --> X[Generate Alert]
    O --> X
    R --> X
    U --> X
    
    W --> Y{Service Restored?}
    Y -->|Yes| Z[Close Circuit Breaker]
    Y -->|No| AA[Continue Monitoring]
    
    Z --> V
    AA --> W
    
    V --> BB{Operation Successful?}
    BB -->|Yes| I
    BB -->|No| CC[Log Persistent Issue]
    
    X --> DD[Notify Operations Team]
    CC --> DD
    
    I --> EE[Update Success Metrics]
    DD --> FF[Update Error Metrics]
    
    style A fill:#ffcdd2
    style I fill:#c8e6c9
    style EE fill:#c8e6c9
    style X fill:#ff8a65
    style DD fill:#ff8a65
    style FF fill:#ffcdd2
```

### Multi-Step Command Execution
```mermaid
flowchart TD
    A[Complex Command Received] --> B[Parse Into Sub-Commands]
    B --> C[Create Execution Plan]
    C --> D[Validate Dependencies]
    
    D --> E{All Dependencies Met?}
    E -->|No| F[Request Missing Dependencies]
    E -->|Yes| G[Start Transaction Session]
    
    F --> H[Wait for User Response]
    H --> I{Dependencies Provided?}
    I -->|No| J[Cancel Operation]
    I -->|Yes| G
    
    G --> K[Execute Step 1]
    K --> L{Step 1 Successful?}
    L -->|No| M[Rollback Transaction]
    L -->|Yes| N[Save Checkpoint]
    
    N --> O{More Steps?}
    O -->|Yes| P[Execute Next Step]
    O -->|No| Q[Commit Transaction]
    
    P --> R{Step Successful?}
    R -->|No| S[Attempt Step Recovery]
    R -->|Yes| T[Update Progress]
    
    S --> U{Recovery Successful?}
    U -->|No| V[Rollback to Checkpoint]
    U -->|Yes| T
    
    T --> W[Notify Progress to User]
    W --> O
    
    V --> X[Partial Rollback Complete]
    M --> Y[Full Rollback Complete]
    
    Q --> Z[Send Completion Summary]
    J --> AA[Send Cancellation Notice]
    X --> BB[Send Partial Failure Notice]
    Y --> CC[Send Failure Notice]
    
    style A fill:#e1f5fe
    style Z fill:#c8e6c9
    style AA fill:#fff3e0
    style BB fill:#ffcdd2
    style CC fill:#ffcdd2
```

## Performance Optimization Flows

### Caching Strategy Flow
```mermaid
flowchart TD
    A[Data Request] --> B{Check L1 Cache}
    B -->|Hit| C[Return Cached Data]
    B -->|Miss| D{Check L2 Cache - Redis}
    
    D -->|Hit| E[Update L1 Cache]
    D -->|Miss| F{Check Database}
    
    E --> C
    F -->|Found| G[Update Both Caches]
    F -->|Not Found| H[Return Null/Default]
    
    G --> I[Return Data]
    
    C --> J[Update Access Metrics]
    I --> J
    H --> K[Log Cache Miss]
    
    J --> L{TTL Expired?}
    L -->|Yes| M[Schedule Cache Refresh]
    L -->|No| N[End]
    
    K --> O{Should Preload?}
    O -->|Yes| P[Trigger Background Load]
    O -->|No| N
    
    M --> Q[Background Refresh]
    P --> Q
    
    Q --> R[Update Cache Silently]
    R --> N
    
    style A fill:#e1f5fe
    style C fill:#c8e6c9
    style I fill:#c8e6c9
    style H fill:#fff3e0
```

---

**Document Type**: Process Flowcharts  
**Last Updated**: August 2024  
**Related**: [C4 Architecture Diagrams](./README.md)