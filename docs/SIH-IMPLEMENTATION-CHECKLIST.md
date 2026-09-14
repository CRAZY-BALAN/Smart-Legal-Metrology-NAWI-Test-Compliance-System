# SIH 26035 Implementation Checklist

## Core
- [x] Authentication gate / demo roles
- [x] Dashboard
- [x] Instrument registration
- [x] OIML test wizard
- [x] Weighing observations
- [x] Repeatability
- [x] Eccentricity
- [x] Discrimination
- [x] OIML calculation engine
- [x] PASS / FAIL evaluation
- [x] Test sessions
- [x] Reports repository
- [x] QR verification endpoint
- [x] Integrity hash
- [x] Offline mode
- [x] ML sample analytics
- [x] Inventory / projects / notifications

## Production hardening to do before real-world use
- [ ] Verify all formulas against the exact governing OIML R-76 edition
- [ ] Add PostgreSQL persistence
- [ ] Add secure authentication and password handling
- [ ] Add role-based server authorization
- [ ] Add immutable audit storage
- [ ] Add controlled report numbering and versioning
- [ ] Add real digital signature / certificate workflow
- [ ] Add actual device adapters for the target NAWI protocols
- [ ] Add automated unit/integration tests for every metrological rule
- [ ] Perform security and acceptance testing
