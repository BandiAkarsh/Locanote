# AI Implementation Roadmap

> **Phased Approach for Adding On-Device AI to Locanote**

---

## Phase 1: Foundation (Weeks 1-2)

### Goals

- Set up AI infrastructure
- Hardware detection
- Worker architecture
- Basic model loading

### Tasks

#### Week 1

- [x] Create AI module structure (`lib/ai/`)
- [x] Implement hardware capability detector
- [x] Define model registry with quantization levels
- [x] Create type definitions
- [ ] Install AI dependencies
  ```bash
  pnpm add @mlc-ai/web-llm @huggingface/transformers onnxruntime-web hnswlib-node
  ```

#### Week 2

- [ ] Implement Web Worker architecture
- [ ] Set up message passing protocol
- [ ] Create basic model loading/unloading
- [ ] Implement Model Manager
- [ ] Add Vite configuration for WebGPU

### Deliverables

- Hardware detection working
- Worker communication established
- Can load/unload embedding model
- All type definitions complete

---

## Phase 2: Core Features (Weeks 3-4)

### Goals

- Auto-tagging working
- Semantic search foundation
- Vector store implementation

### Tasks

#### Week 3: Auto-Tagging

- [ ] Integrate zero-shot classification model
- [ ] Create tag suggestion algorithm
- [ ] Build tag confidence scoring
- [ ] Add UI for tag suggestions
- [ ] Implement tag acceptance/dismissal

#### Week 4: Semantic Search

- [ ] Implement embedding generation pipeline
- [ ] Create vector store with HNSW indexing
- [ ] Build hybrid search (semantic + keyword)
- [ ] Add search result highlighting
- [ ] Persist vector index to IndexedDB

### Deliverables

- Auto-tagging suggests tags based on content
- Vector store indexes notes
- Search returns semantic results
- All features toggleable in UI

---

## Phase 3: Advanced Features (Weeks 5-6)

### Goals

- Note summarization
- Writing assistant
- Smart links

### Tasks

#### Week 5: Summarization & Writing

- [ ] Integrate summarization model (BART/DistilBART)
- [ ] Create summary generation with styles
- [ ] Add key point extraction
- [ ] Implement writing assistant with completion
- [ ] Add grammar checking

#### Week 6: Smart Links

- [ ] Build note similarity detection
- [ ] Create "related notes" feature
- [ ] Implement link suggestion algorithm
- [ ] Add graph visualization preparation
- [ ] Build auto-linking for mentions

### Deliverables

- Can generate summaries (concise, detailed, bullet points)
- Writing assistant provides ghost text
- Smart links suggest related notes
- Command palette integration

---

## Phase 4: Optimization (Weeks 7-8)

### Goals

- Performance optimization
- Battery awareness
- Memory management

### Tasks

#### Week 7: Performance

- [ ] Implement model quantization (Q4, Q8)
- [ ] Add lazy loading strategies
- [ ] Optimize embedding caching
- [ ] Implement vector quantization
- [ ] Add batch processing for bulk operations

#### Week 8: Resource Management

- [ ] Battery-aware task scheduling
- [ ] Pause AI on low battery (< 20%)
- [ ] Implement memory pressure handling
- [ ] Add model LRU cache
- [ ] Create background task queue

### Deliverables

- AI pauses when battery low
- Models quantize based on device tier
- Memory usage stays within budget
- Background tasks queue properly

---

## Phase 5: Polish (Weeks 9-10)

### Goals

- UI/UX refinement
- Error handling
- User onboarding

### Tasks

#### Week 9: UX Refinement

- [ ] Add confidence indicators
- [ ] Implement progressive disclosure
- [ ] Create inline suggestion styling
- [ ] Add loading states
- [ ] Build AI settings panel

#### Week 10: Final Polish

- [ ] Error boundaries for AI failures
- [ ] Retry mechanisms
- [ ] User onboarding tour
- [ ] Feature discovery hints
- [ ] Performance monitoring

### Deliverables

- Smooth, magical-feeling AI
- Clear confidence indicators
- Graceful fallbacks
- Onboarding explains features

---

## Testing Strategy

### Unit Tests

```typescript
// Hardware detection
describe("HardwareDetector", () => {
  it("detects WebGPU support");
  it("calculates correct device tier");
  it("monitors battery status");
});

// Model selection
describe("Model Selection", () => {
  it("selects appropriate model for tier");
  it("falls back to smaller models");
  it("respects VRAM constraints");
});

// Vector store
describe("VectorStore", () => {
  it("adds and retrieves documents");
  it("searches by similarity");
  it("persists to IndexedDB");
});
```

### Integration Tests

- End-to-end auto-tagging workflow
- Search and retrieval pipeline
- Battery-aware behavior
- Model loading/unloading

### Performance Benchmarks

| Metric          | Target  | Acceptable |
| --------------- | ------- | ---------- |
| Model Load      | < 2s    | < 5s       |
| First Inference | < 500ms | < 2s       |
| Embedding Gen   | < 50ms  | < 200ms    |
| Search Query    | < 100ms | < 300ms    |
| Memory Usage    | < 2GB   | < 4GB      |

---

## Dependencies by Phase

### Phase 1

- `@mlc-ai/web-llm`
- `@huggingface/transformers`
- `onnxruntime-web`

### Phase 2

- `hnswlib-node` (vector search)

### Phase 3

- No new dependencies

### Phase 4

- Model quantization tools (build-time)

### Phase 5

- No new dependencies

---

## Risks & Mitigations

| Risk                 | Impact | Mitigation                   |
| -------------------- | ------ | ---------------------------- |
| WebGPU not supported | High   | Fallback to WASM/CPU         |
| Models too large     | Medium | Quantization, lazy loading   |
| Battery drain        | Medium | Battery-aware scheduling     |
| First load slow      | Low    | Progress indicators, caching |
| Privacy concerns     | Low    | All on-device, no cloud      |

---

## Success Criteria

### Technical

- [ ] All features work offline
- [ ] Zero data sent to cloud
- [ ] < 100MB additional bundle size
- [ ] < 2GB RAM usage on mid-tier devices
- [ ] < 5s cold start on slow devices

### UX

- [ ] AI feels magical, not intrusive
- [ ] Users can disable any feature
- [ ] Clear confidence indicators
- [ ] Graceful degradation
- [ ] Performance mode on battery

---

## Post-Launch (Future)

- Federated learning (opt-in)
- Custom model training
- Multi-language support
- Voice transcription
- Image understanding

---

_Start Date: March 2026_
_Estimated Completion: May 2026_
