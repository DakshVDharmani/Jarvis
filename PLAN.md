# JARVIS: A Nine-Month, Zero-API-Cost Build Plan

**Owner:** Daksh Dharmani  
**Duration:** 39 weeks (approximately nine months)  
**Target effort:** 12–15 focused hours per week (about 500–580 hours total)  
**Primary platform:** Ubuntu on the ASUS TUF laptop; Windows support added after the Linux version is stable  
**Mission:** Build, understand, test, and defend a local-first personal assistant—not a thin wrapper around an API.

---

## 1. The promise—and the honest constraint

At the end of nine months, JARVIS should be able to hear you, understand a useful set of commands, remember relevant personal context, plan bounded multi-step jobs, operate approved parts of your computer, answer through speech and a desktop interface, and explain what it is doing. Its normal operating path must not require a paid AI API.

You will also build and train your own language model from random weights. On a student laptop, that model should be treated as a **small research LLM**, not a competitor to GPT or Claude. A sensible target is roughly **10–50 million parameters**, trained on a deliberately small, legally usable corpus. It can demonstrate tokenization, next-token prediction, attention, sampling, evaluation, and limited domain conversation. A GPT-class model requires data, compute, engineering, and electricity far beyond a zero-budget personal project.

Therefore, JARVIS will support two local brain adapters:

1. **`DakshLM`** — your tokenizer, transformer implementation, training loop, checkpoints, evaluator, and inference code. This proves deep understanding.
2. **`LocalOpenModel`** — an optional, replaceable open-weight model running locally through `llama.cpp`. This gives the finished assistant stronger natural-language ability without per-message charges.

Neither model receives direct authority over the machine. Both return structured proposals to a deterministic permission and execution layer that you write.

### What “from scratch” means in this project

| Component | You implement first | Production fallback allowed? |
|---|---|---|
| Command understanding | Rules, TF-IDF/logistic regression, then your neural classifier | Yes |
| Tokenizer | Character tokenizer, then BPE trainer/encoder/decoder | Yes, after yours passes tests |
| Neural network | Dense layers and backprop exercises in NumPy | PyTorch for the real training run |
| Language model | Decoder-only transformer trained from random weights | Open-weight local model as second adapter |
| Wake word | Dataset, features, small CNN, thresholding | Pretrained VAD allowed |
| Speech-to-text | Small educational CTC/keyword experiment | Local Whisper runtime for useful transcription |
| Text-to-speech | Learn and prototype the pipeline | Local Piper-compatible runtime/OS voice |
| Embedding retrieval | Your cosine-similarity implementation | Local embedding model/index later |
| Planner | State machine/DAG executor, validations, retries | LLM may propose plans, never bypass executor |
| Tools and permissions | Entire protocol, registry, policy, audit log | No black-box agent framework in V1 |
| UI | Your React/TypeScript desktop client | Component libraries allowed |

This is the governing rule for all nine months:

> **Understand → build a miniature version → measure it → replace only when production quality requires it.**

---

## 2. Definition of JARVIS 1.0

JARVIS 1.0 is complete only when all of the following work in a recorded clean-install demonstration:

- Starts locally with one documented command and no cloud API key.
- Supports push-to-talk and a trained “Jarvis” wake-word experiment.
- Converts speech to text locally and speaks responses locally.
- Understands at least 25 tested intents and extracts their entities.
- Loads tools through a schema-based plugin registry.
- Can safely search files, summarize system status, launch applications, manage notes, set local reminders, inspect a Git repository, and execute several read-only workflows.
- Supports at least five multi-step workflows with dependency handling, timeouts, retries, and partial-failure reporting.
- Uses working, episodic, semantic, and procedural memory with explicit retention controls.
- Shows the proposed plan and asks before risky actions.
- Records an immutable-enough audit trail for tool calls, arguments, policy decisions, results, duration, and failures.
- Includes your self-trained `DakshLM` and a report comparing it with the optional local open-weight model.
- Has a responsive desktop UI showing listening state, transcript, plan, permissions, active tools, memories used, and results.
- Passes unit, integration, security, latency, and recovery tests.
- Has an architecture document, threat model, model card, demo video, benchmark report, and recruiter-friendly README.

### Explicitly outside JARVIS 1.0

Do not let these consume the nine months:

- unrestricted autonomous browsing or shell access;
- banking, purchases, or sending messages without confirmation;
- perfect general conversation;
- training a billion-parameter model from scratch;
- custom voice cloning;
- smart-home hardware;
- mobile apps;
- simultaneous Windows and Linux feature parity;
- face recognition or continuous camera surveillance;
- public multi-user hosting.

These belong in V2 after the local single-user system is safe and reliable.

---

## 3. System architecture

```text
Microphone / Text / Screenshot
              |
              v
    Perception and Normalization
    VAD -> wake word -> STT -> text
              |
              v
       Intent and Entity Router
      /          |             \
 deterministic  DakshLM   local open model
      \          |             /
              v
        Structured Plan Proposal
              |
              v
     Policy + Permission Engine
              |
              v
      DAG Scheduler / Tool Bus
      |        |       |       |
    Files     OS      Notes    Git ...
              |
              v
     Verification + Audit Event
              |
              v
 Memory Update / UI / Local Speech
```

### Non-negotiable boundaries

- **Models propose; code decides.** Natural-language model output is untrusted input.
- **Every tool has a typed schema.** Reject unknown fields and invalid values.
- **Default deny.** A tool receives only explicitly granted capabilities.
- **Read and write are separate permissions.** “Read Documents” never implies “modify Documents.”
- **No raw shell tool in normal mode.** Approved commands use argument arrays, allowlists, timeouts, and fixed working directories.
- **Destructive actions require a preview and confirmation.** The confirmation describes the exact target.
- **Tool output is untrusted.** Web pages and file contents cannot grant themselves authority.
- **Memory is inspectable and deletable.** The user can see why a memory was retrieved and remove it.
- **Offline failure must be graceful.** Core actions remain available without internet.

### Core services

| Service | Responsibility | Interface |
|---|---|---|
| `audio-service` | microphone stream, VAD, wake word, STT, TTS | local WebSocket/events |
| `core` | sessions, routing, planning, context assembly | Python API |
| `policy` | capability checks, risk scoring, confirmations | pure Python package |
| `tool-runtime` | discovery, validation, isolation, execution | typed tool protocol |
| `memory` | working/episodic/semantic/procedural stores | repository interface |
| `model-runtime` | `DakshLM` and open-model adapters | common generation interface |
| `scheduler` | DAG execution, retries, cancellation, compensation | event-driven jobs |
| `desktop-ui` | voice/text interaction and observability | React + TypeScript |
| `event-log` | append-only audit and metrics | SQLite |

---

## 4. Six phases at a glance

| Phase | Weeks | Main outcome |
|---|---:|---|
| I. Foundations and deterministic core | 1–6 | A tested CLI assistant with no AI |
| II. Ears, voice, and language routing | 7–12 | A local voice assistant with trained wake word and intent model |
| III. Neural foundations and your own LLM | 13–19 | `DakshLM`, trained from random weights and evaluated |
| IV. Memory, plugins, and security | 20–26 | A safe extensible assistant with durable memory |
| V. Planning, desktop UI, and perception | 27–33 | A visible multi-step desktop JARVIS |
| VI. Integration, hardening, and launch | 34–39 | Reliable JARVIS 1.0, evidence, demo, and portfolio package |

Each phase ends with a gate. Do not move forward because the calendar changed; move forward because the gate passes.

---

# PHASE I — Foundations and deterministic core

## Weeks 1–6: build the nervous system before the brain

### Week 1 — Baseline, engineering contract, and Python fluency

**Learn**

- Python project structure, virtual environments, type hints, dataclasses, protocols, exceptions, context managers, iterators, decorators, and packaging.
- Git branches, conventional commits, issues, pull requests, semantic versions, and `.gitignore` hygiene.
- Unit tests, fixtures, mocking, property-based thinking, logging, and configuration.

**Build**

- Create the monorepo and architecture decision records (`docs/adr/`).
- Write `pyproject.toml`, formatter/linter/type-check/test commands, and a `Makefile` or task runner.
- Create a typed configuration loader with safe defaults and no secrets committed.
- Add structured JSON logging with correlation IDs.
- Record hardware baselines: CPU, RAM, GPU/VRAM, disk, OS, Python, idle load, microphone, and average power mode.

**Evidence**

- CI runs lint, type checks, and tests.
- `jarvis doctor` prints a sanitized environment report.
- One-page ADR: why Python core + TypeScript UI + SQLite.

### Week 2 — OS, processes, files, and safe command execution

**Learn**

- Processes vs threads, signals, exit codes, environment variables, pipes, file descriptors, paths, permissions, and Linux `/proc`.
- Why shell strings are dangerous; argument arrays, allowlists, timeouts, output limits, and cancellation.

**Build**

- A process inspector for CPU/RAM/top processes.
- A safe application launcher driven by an alias registry.
- A read-only file finder constrained to configured roots.
- A command result type: status, stdout/stderr summary, duration, and error category.

**Tests**

- Reject traversal outside allowed roots.
- Kill timed-out child processes.
- Handle missing application, permission denied, huge output, and cancellation.

### Week 3 — Networking and asynchronous Python

**Learn**

- TCP, DNS, HTTP, REST, WebSockets, JSON, request lifecycle, authentication concepts, and retry safety.
- `asyncio`, tasks, queues, locks, cancellation, backpressure, and blocking-vs-nonblocking work.

**Build**

- A tiny TCP echo/chat server, then a local WebSocket event server.
- An in-process event bus with typed events.
- Health, readiness, and metrics endpoints bound only to localhost.

**Tests**

- Concurrent clients, disconnect during work, slow consumer, cancellation, and restart.

### Week 4 — Parsing, intents, and entities without ML

**Learn**

- Lexing/parsing basics, regex limits, grammars, command patterns, ambiguity, confidence, and normalization.

**Build**

- Define an `Intent`, `Entity`, and `Command` representation.
- Implement 10 rule-based intents: help, time, system status, launch app, find file, list directory, create/read note, start timer, and cancel.
- Add clarification: “open it” fails safely unless a resolvable referent exists.
- Create a labeled dataset format for utterance, intent, entities, source, and split.

**Metric target**

- 95% exact intent accuracy on a hand-written 100-command deterministic test set.

### Week 5 — Tool registry and permission kernel

**Learn**

- Interfaces, dependency injection, plugin discovery, JSON Schema, capability-based security, least privilege, and auditability.

**Build**

- `ToolManifest`: name, version, description, input/output schema, permissions, risk, timeout, and idempotency.
- Registry that discovers tools but loads only enabled ones.
- Permission levels: read-only, safe write, sensitive write, external communication, privileged.
- Dry-run preview and confirmation challenge for sensitive actions.
- Append-only audit events in SQLite.

**Security tests**

- Unknown tool, malformed arguments, duplicate registration, permission escalation, symlink escape, and denial logging.

### Week 6 — CLI JARVIS 0.1 and Gate I

**Build**

- A polished REPL with history, cancellation, help, explain-plan, and session IDs.
- 15 deterministic intents and at least 8 tools.
- End-to-end tests from user text to result and audit event.

**Gate I must pass**

- 30-minute offline demo without an LLM.
- 100 repeated commands with zero crashes.
- Every tool call has a permission decision and audit record.
- At least 70% unit-test coverage on policy, parser, and tool runtime—not vanity coverage on trivial files.
- Architecture diagram and threat-model draft updated.

**Phase deliverable:** `v0.1.0-deterministic-cli`

---

# PHASE II — Ears, voice, and language routing

## Weeks 7–12: make JARVIS hear and speak locally

### Week 7 — Digital audio foundations

**Learn**

- Amplitude, frequency, sampling rate, bit depth, mono/stereo, PCM/WAV, frames, buffering, latency, FFT, spectrogram, Mel scale, MFCC, signal-to-noise ratio, and clipping.

**Build**

- Microphone recorder with device selection and live level meter.
- WAV reader/writer without hiding the file structure behind a high-level library.
- Notebook/script that visualizes waveform, FFT, spectrogram, and Mel features.
- A reproducible noise-profile recording from your normal room.

### Week 8 — Streaming, VAD, and interruption

**Learn**

- Ring buffers, audio chunks, end-of-utterance detection, false activation, echo, debounce, and backpressure.

**Build**

- Streaming microphone pipeline.
- First energy-threshold VAD that you implement, then compare with a production local VAD.
- Push-to-talk mode as the reliable fallback.
- “Stop”/escape handling that cancels speech and active jobs.

**Metric target**

- Median end-of-speech detection below 700 ms in a quiet room.

### Week 9 — Your wake-word dataset

**Learn**

- Positive/negative sampling, augmentation, class imbalance, train/validation/test separation by recording session, precision/recall, ROC curves, and threshold selection.

**Build**

- Record 300–500 positive “Jarvis” clips across days, distances, speaking styles, and background conditions.
- Collect at least 2,000 negative windows from ordinary speech and ambient audio; never record other people without consent.
- Generate Mel-spectrogram tensors; add noise, gain, shift, and speed augmentations.
- Create a documented dataset card and consent/deletion policy.

### Week 10 — Train the wake-word model

**Learn**

- Convolution, pooling, receptive field, regularization, class weighting, calibration, overfitting, and confusion matrices.

**Build**

- A small CNN wake-word detector in PyTorch.
- Streaming window inference with cooldown and smoothed scores.
- Threshold tuning utility and false-trigger logger.

**Metric target**

- At least 90% recall on held-out personal recordings and fewer than 2 false activations per quiet-hour test. Treat this as a starting target, not a publishable universal claim.

### Week 11 — Local speech-to-text and text-to-speech

**Learn**

- ASR pipeline, acoustic features, CTC intuition, encoder-decoder attention, word error rate, beam search, text normalization, phonemes, acoustic models, and vocoders.

**Build**

- A tiny educational keyword recognizer or toy CTC experiment.
- A common `SpeechRecognizer` interface.
- Local production adapter using Whisper-compatible offline inference.
- A `SpeechSynthesizer` interface and local offline voice adapter.
- Stream partial transcript and allow barge-in.

**Metric targets**

- Measure, do not guess: word error rate on 50 of your commands.
- Time to first transcript and total real-time factor documented.
- Speech can be interrupted within 300 ms after the stop event reaches the core.

### Week 12 — ML intent router and Gate II

**Learn**

- Bag-of-words, TF-IDF, logistic regression, train/validation/test split, macro F1, data leakage, calibration, out-of-distribution rejection, and entity extraction.

**Build**

- Expand to at least 25 intents and roughly 40–60 varied examples per intent.
- Train a TF-IDF + logistic-regression baseline.
- Train a small neural classifier and compare it fairly.
- Use rules for high-risk exact commands; use ML for flexible routing.
- Add “unknown” and clarification behavior below a calibrated confidence threshold.

**Gate II must pass**

- Voice → transcript → intent → policy → tool → speech works offline.
- Macro F1 ≥ 0.90 on a genuinely held-out intent set, or an honest error report explains why.
- Unknown requests are rejected/clarified instead of forced into the nearest intent.
- One-hour voice soak test completes with no unrecoverable crash.

**Phase deliverable:** `v0.2.0-local-voice`

---

# PHASE III — Neural foundations and your own LLM

## Weeks 13–19: build the brain in layers

### Week 13 — Math you will actually use

**Learn and implement**

- Vectors, matrices, dot products, matrix multiplication, transpose, norms, cosine similarity.
- Probability distributions, conditional probability, expectation, variance, maximum likelihood.
- Derivatives, partial derivatives, chain rule, gradients.
- Losses: MSE and cross-entropy; activations: sigmoid, tanh, ReLU, softmax.

**Build**

- NumPy linear regression and logistic regression from scratch.
- Numerical gradient checker using finite differences.
- Short notes explaining shapes through every equation.

### Week 14 — Neural networks and backpropagation

**Build from scratch with NumPy**

- `Tensor`/parameter representation sufficient for a small multilayer perceptron.
- Dense layer, activations, cross-entropy, forward pass, backward pass, SGD, mini-batches.
- Train on XOR and a small digit/classification dataset.

**Then rebuild in PyTorch** and compare code, speed, stability, and gradients.

**Gate inside the week:** gradient-check relative error below an agreed tolerance on tiny test cases.

### Week 15 — Sequence models and attention

**Learn**

- N-grams, language-model likelihood, perplexity, embeddings, RNN/LSTM limitations, attention, queries/keys/values, masking, residual connections, LayerNorm, and positional information.

**Build**

- Character bigram language model.
- Small recurrent language model.
- Single-head scaled dot-product attention in NumPy with causal masking.
- Shape and mask tests, including “future tokens cannot affect earlier logits.”

### Week 16 — Build your tokenizer

**Build**

- Unicode normalization policy.
- Character tokenizer baseline.
- Byte-pair encoding trainer, vocabulary serializer, encoder, and decoder.
- Special-token handling and deterministic round-trip tests.

**Evaluate**

- Vocabulary size, compression ratio, unknown behavior, English/code/Hinglish samples, and token-length distribution.
- Keep the V1 assistant’s spoken output English-first; multilingual expansion is optional after launch.

### Week 17 — Build the decoder-only transformer

**Build in PyTorch, without using a ready-made transformer model class**

- Token embeddings and positional encoding/embedding.
- Causal multi-head self-attention.
- Feed-forward block, residuals, normalization, dropout.
- Repeated decoder blocks and language-model head.
- Weight initialization, optimizer, learning-rate schedule, gradient clipping, checkpointing, and deterministic seeds.
- Autoregressive generation with greedy, temperature, top-k, and top-p sampling.

**Tests**

- Tensor shapes, causal mask, save/load equality, fixed-seed reproducibility, overfit-one-batch test, and loss decreases on a tiny corpus.

### Week 18 — Data pipeline and training `DakshLM`

**Data rules**

- Use public-domain, permissively licensed, or personally authored text/code only.
- Preserve source, license, version, preprocessing, and exclusions in a manifest.
- Deduplicate, remove obvious secrets/PII, separate validation by document, and prevent evaluation leakage.
- Do not scrape indiscriminately. The dataset is part of the engineering deliverable.

**Training ladder**

1. 100K–1M parameter smoke model to validate the pipeline.
2. 5–10M parameter model to tune sequence length and learning rate.
3. Final 10–50M parameter run only after estimates fit available VRAM/RAM, storage, thermals, and time.

**Required experiment tracking**

- Config hash, dataset version, token count, parameter count, steps, batch/accumulation, train/validation loss, perplexity, tokens/second, peak memory, checkpoint size, duration, and sample outputs.

Never leave long training unattended until temperature, memory, checkpoints, and resume behavior have been proven.

### Week 19 — Evaluate, serve, and integrate your LLM

**Build**

- `LanguageModel` adapter shared by `DakshLM` and the optional local open-weight runtime.
- Local inference endpoint bound to loopback only.
- Structured-output constraint/parser for intent or plan proposals.
- Model card: architecture, parameter count, data, licenses, intended use, limitations, safety, and results.

**Evaluate**

- Held-out loss/perplexity.
- 50 fixed prompts covering completion, command paraphrase, abstention, basic recall, code/text mixture, and adversarial instructions.
- Compare latency, memory, accuracy, and usefulness with rules, intent classifier, and optional open model.

**Gate III must pass**

- A transformer trained from random weights by your code can save, reload, and generate.
- Training is reproducible enough to repeat a small run.
- Dataset lineage and licenses are documented.
- JARVIS can swap brain adapters without changing tool code.
- No model output can directly invoke the OS.

**Phase deliverable:** `v0.3.0-dakshlm`

---

# PHASE IV — Memory, plugins, and security

## Weeks 20–26: make JARVIS extensible without making it reckless

### Week 20 — Relational memory foundation

**Learn**

- SQL, normalization, indexes, transactions, ACID, migrations, foreign keys, query plans, and backup/restore.

**Build**

- SQLite schemas for users/settings, sessions, messages, memories, tools, permissions, jobs, steps, and audit events.
- Migration command, transactional repositories, and automated backup/restore test.
- Working-memory budget with summarization only through a model adapter, never silently discarding raw session data before retention policy allows it.

### Week 21 — Semantic retrieval from first principles

**Build**

- Start with TF-IDF retrieval.
- Implement cosine similarity and brute-force top-k yourself.
- Add a local embedding adapter; store embedding model/version with every vector.
- Chunking with provenance: source, offsets, timestamp, hash, and access level.
- Hybrid retrieval combining keywords, semantic score, recency, and source trust.

**Evaluate**

- Create 50 question→relevant-memory judgments.
- Report Recall@k and Mean Reciprocal Rank; inspect failures manually.

### Week 22 — Four kinds of memory

**Implement**

- **Working:** current turn, active goal, selected objects, recent tool results.
- **Episodic:** timestamped interactions/events, with confidence and provenance.
- **Semantic:** stable facts/preferences explicitly accepted or strongly evidenced.
- **Procedural:** versioned workflows and tool instructions.

**Controls**

- View, edit, forget, export, retention duration, “do not remember this,” and private-session mode.
- Never convert guesses into facts. Store source and confidence.

### Week 23 — Production-grade plugin protocol

**Build**

- Manifest validation and semantic version compatibility.
- Typed input/output, progress events, cancellation, timeout, resource limits, and standardized errors.
- Tool lifecycle: discovered → validated → enabled → permissioned → running → completed/failed/cancelled.
- Five high-quality tools: filesystem search, notes, system monitor, application launcher, and Git inspector.

**Stretch:** implement one tool out-of-process over local JSON-RPC to prove isolation boundaries.

### Week 24 — Authentication, secrets, and sandboxing

**Learn**

- Threat modeling, authentication vs authorization, OAuth concepts, encryption at rest/in transit, key storage, dependency risk, path traversal, command injection, SSRF, and prompt injection.

**Build**

- Threat model using assets, trust boundaries, attackers, abuse cases, mitigations, and residual risk.
- Secret abstraction using OS keyring when a connector eventually needs credentials.
- Per-tool filesystem roots and network allowlists.
- Sanitized logs; never store tokens, raw passwords, or unnecessary full document contents.

### Week 25 — Safe useful integrations

Add local-first tools with explicit scopes:

- local reminders and timers;
- notes search/create/update;
- Git status, log, branch, diff summary (read-only first);
- file metadata/search and approved copy operations;
- system health and application control;
- optional public weather/RSS adapter that cleanly reports offline status.

Avoid email/calendar send operations until a future phase; a correct recipient and final confirmation system deserves its own design.

### Week 26 — Attack the system and Gate IV

**Test suite**

- Prompt injection inside a file telling JARVIS to ignore policy.
- Malicious filenames and symlinks.
- Tool schema confusion and extra fields.
- Shell metacharacters in user text.
- Oversized tool output and infinite-running child process.
- Database corruption simulation and restore.
- Plugin crash, network disappearance, and restart mid-job.
- Attempts to read secrets or escape approved roots.

**Gate IV must pass**

- Plugins can be added without editing the core router.
- Memory retrieval has measured quality and visible provenance.
- Risky calls cannot execute without the required capability and confirmation.
- Backup restoration and audit export work.
- Threat model lists accepted residual risks honestly.

**Phase deliverable:** `v0.4.0-safe-memory-tools`

---

# PHASE V — Planning, desktop UI, and perception

## Weeks 27–33: turn components into a visible assistant

### Week 27 — Deterministic planner and task graphs

**Learn**

- Finite-state machines, DAGs, topological sorting, preconditions/postconditions, idempotency, retries, exponential backoff, compensation, and human-in-the-loop checkpoints.

**Build**

- `Plan`, `Step`, dependency, status, retry policy, timeout, expected effect, and verification schema.
- Deterministic templates for common workflows.
- DAG validator: cycles, missing dependencies, unavailable tools, invalid permissions, and impossible output references.
- Scheduler with pause, resume, cancel, retry, and bounded parallel execution.

### Week 28 — Model-assisted planning without surrendering control

**Build**

- Let a model propose JSON plans using only currently enabled tool manifests.
- Parse and validate; reject unrecognized tools/fields.
- Simulate/dry-run before approval.
- Re-plan only from explicit failure state, with a maximum attempt count.
- Save the proposal, validation decision, modifications, and execution result separately.

**Evaluate**

- 50 fixed goals; score valid plan rate, task success, unnecessary steps, unsafe proposal rate, and clarification rate.

### Week 29 — Desktop UI foundation

**Learn/build**

- React + TypeScript component architecture, state machines, accessibility, WebSocket events, desktop packaging, and secure IPC.
- Screens: conversation, listening/transcribing state, plan timeline, tool activity, result, and error recovery.
- Keep the Python process authoritative; UI requests actions through a narrow API.

### Week 30 — Trust and observability UI

**Build**

- Permission modal with exact action, target, reason, risk, and expiry.
- Memory inspector showing retrieved items, provenance, and forget controls.
- Tool/plugin manager with scopes and enable/disable.
- Audit viewer and performance panel.
- Keyboard-only operation, visible focus, captions, and a non-voice path for every essential feature.

The glowing orb is optional. Trust, latency visibility, and recovery are not.

### Week 31 — Screen and document perception

**Learn**

- Image matrices, color spaces, resize/crop, thresholding, contours, OCR concepts, object detection vs classification, and privacy implications.

**Build**

- Explicit screenshot capture only after user action or visible capture indicator.
- OCR adapter and region selection.
- Basic UI element/text extraction with coordinates and confidence.
- Redaction of configured sensitive regions before persistence.

Do not automate arbitrary clicking yet. First make the perception result inspectable and correct.

### Week 32 — Five flagship workflows

Implement and polish exactly these before adding more:

1. **Study session:** find CN/DSA notes → rank → open selected file → start timer → create session note.
2. **Git project check:** inspect repository → summarize changed files/tests → suggest next action; no write without approval.
3. **System cleanup advisor:** inspect storage/processes → explain safe candidates; never delete automatically.
4. **Document workflow:** locate latest approved document → copy to safe output → run local conversion if available → verify output.
5. **Personal recall:** retrieve a stored project decision with source → explain confidence → allow correction/forgetting.

Each workflow needs golden-path, ambiguity, denial, cancellation, and injected-failure tests.

### Week 33 — Full alpha and Gate V

**Gate V must pass**

- Five workflows achieve ≥80% success over a fixed test suite without manual code changes between attempts.
- The UI accurately shows current state; no false “done” when a step failed.
- Restart resumes or safely marks interrupted jobs.
- Voice, text, and UI stay synchronized.
- Screen capture is explicit, visible, bounded, and deletable.

**Phase deliverable:** `v0.5.0-desktop-alpha`

---

# PHASE VI — Integration, hardening, and launch

## Weeks 34–39: make it dependable and defensible

### Week 34 — End-to-end observability and performance

**Measure**

- Wake-to-listening, speech-end-to-transcript, router latency, planning latency, permission wait, tool duration, time-to-first-spoken-response, total completion time.
- CPU, GPU, RAM/VRAM, disk, model load time, tokens/second, audio dropouts, and battery impact.

**Optimize in order**

1. Correctness.
2. Eliminate accidental blocking and repeated model loads.
3. Cache safe deterministic artifacts.
4. Quantize/swap model only after baseline measurement.
5. Improve perceived latency with streaming and honest progress.

### Week 35 — Reliability engineering

**Build/test**

- Failure taxonomy and user-facing recovery messages.
- Circuit breakers for repeatedly failing tools.
- Crash recovery, job checkpoints, database backup rotation, and clean shutdown.
- 4-hour soak test, 500-command scripted test, rapid cancellation, sleep/wake, microphone disconnect, disk-low condition, and network loss.

### Week 36 — Security review and privacy pass

**Complete**

- Review every permission and filesystem root.
- Dependency/license inventory and vulnerability scan.
- Fuzz schemas/parsers and repeat prompt-injection suite.
- Confirm localhost binding, authentication where required, CORS restrictions, and no debug endpoints exposed.
- Verify uninstall/data-export/data-delete paths.
- Write `SECURITY.md`, privacy model, and responsible-use limitations.

### Week 37 — Evaluation and honest comparison

Create a frozen benchmark pack and report:

| Area | Core metric |
|---|---|
| Wake word | recall and false activations/hour |
| STT | word error rate on personal command set |
| Intent | macro F1 + unknown rejection |
| Entities | span-level F1/exact match |
| Retrieval | Recall@k and MRR |
| Planning | valid-plan and task-success rates |
| Tools | success, failure, cancellation, rollback/compensation |
| Latency | median and p95 per pipeline stage |
| Models | held-out loss/perplexity, memory, tokens/second, qualitative rubric |
| Security | attacks blocked, known residual risks |

Compare four routing modes where relevant: deterministic rules, classical ML, `DakshLM`, and the optional local open model. Do not cherry-pick only successful demos.

### Week 38 — Documentation and portfolio package

Produce:

- README with 30-second value proposition, architecture, demo, install, safety, benchmarks, and limitations.
- `ARCHITECTURE.md` with components, event flow, data model, and ADR links.
- `THREAT_MODEL.md`, `SECURITY.md`, `PRIVACY.md`.
- `MODEL_CARD_DAKSHLM.md` and dataset card.
- Developer guide for creating a tool.
- User manual and troubleshooting guide.
- Five-minute demo script and three-minute recruiter version.
- A technical report explaining what you implemented yourself versus reused.

### Week 39 — Release candidate and Gate VI

**Release procedure**

- Install from a fresh environment using only documented steps.
- Run all automated tests and frozen benchmarks.
- Run the five flagship workflows twice: once online, once with network disabled where applicable.
- Record the demo from the release commit.
- Tag `v1.0.0`, publish release notes, known issues, checksums, and a roadmap for V1.1/V2.

**Gate VI**

- No critical known permission bypass.
- No paid API required for the core demo.
- Setup is reproducible on your own clean OS user account.
- Metrics and limitations are public and consistent with the demo.
- You can explain every box and arrow without reading a script.

**Final deliverable:** `JARVIS v1.0.0`

---

## 5. The zero-cost technology stack

“Free” here means no subscription or per-request bill. It does not mean zero electricity, storage, download bandwidth, or hardware wear. Use the hardware you already own, keep the service local, and make cloud services optional.

| Layer | Primary choice | Why |
|---|---|---|
| Core | Python 3.12+ | ML ecosystem, systems scripting, async, readable architecture |
| API/events | FastAPI/Starlette-style local service + WebSockets | typed local interfaces and streaming events |
| Validation | Pydantic-style models / JSON Schema | strict tool and plan boundaries |
| Database | SQLite with FTS | zero-server relational store, transactions, search, backups |
| ML training | NumPy first, then PyTorch | learn mechanics, then use GPU/autograd responsibly |
| Local LLM inference | `llama.cpp` adapter | quantized local inference and CPU/GPU hybrid support |
| Speech recognition | `whisper.cpp`-compatible local adapter | offline ASR, quantization, CPU/GPU options, VAD support |
| Speech synthesis | maintained local Piper-compatible/OS adapter | offline speech with a replaceable interface |
| DSP/audio | sounddevice/PortAudio-style capture + NumPy/librosa-style analysis | control of streaming plus educational signal analysis |
| Classical ML | scikit-learn | strong intent/retrieval baselines |
| Vision/OCR | OpenCV + local OCR engine | inspectable local preprocessing and OCR |
| UI | React + TypeScript + Vite | matches your existing frontend direction |
| Desktop shell | Tauri or a similarly narrow desktop bridge | smaller privilege surface than exposing a browser app broadly |
| Testing | pytest, property tests, integration fixtures, Playwright-style UI tests | layered evidence |
| Quality | formatter, linter, type checker, pre-commit | consistent code and early failures |
| Packaging | Python package + locked dependencies; desktop installer later | reproducible development first |

Do not couple core interfaces to product names. `SpeechRecognizer`, `SpeechSynthesizer`, `LanguageModel`, `Embedder`, and `ToolExecutor` are adapters. If a project becomes unmaintained or unsuitable, you replace one adapter rather than rewrite JARVIS.

### Why local inference is feasible

The official `llama.cpp` project supports quantized inference across CPU and GPU backends, including NVIDIA CUDA and CPU+GPU hybrid execution. That makes a small quantized open-weight model a realistic optional companion on limited VRAM, although actual speed must be benchmarked on your machine. `whisper.cpp` likewise documents CPU inference, NVIDIA GPU support, integer quantization, VAD, and Windows/Linux platforms. See the official references at the end of this plan.

---

## 6. Proposed repository layout

```text
jarvis/
├── README.md
├── PLAN.md
├── pyproject.toml
├── apps/
│   ├── cli/
│   └── desktop/
├── jarvis/
│   ├── core/
│   ├── events/
│   ├── intents/
│   ├── planner/
│   ├── policy/
│   ├── scheduler/
│   ├── memory/
│   ├── tools/
│   ├── audio/
│   ├── vision/
│   ├── models/
│   │   ├── interfaces/
│   │   ├── dakshlm/
│   │   └── local_open_model/
│   └── storage/
├── plugins/
│   ├── filesystem/
│   ├── system_monitor/
│   ├── app_launcher/
│   ├── notes/
│   └── git_inspector/
├── datasets/
│   ├── manifests/
│   └── README.md
├── experiments/
│   ├── wake_word/
│   ├── intent/
│   └── dakshlm/
├── tests/
│   ├── unit/
│   ├── integration/
│   ├── security/
│   ├── e2e/
│   └── benchmarks/
├── docs/
│   ├── adr/
│   ├── architecture/
│   ├── threat-model/
│   ├── model-cards/
│   └── demo/
└── scripts/
```

Never commit model weights, raw private recordings, secrets, database contents, generated audio, or large datasets. Store manifests and reproducible download/preparation scripts; keep private data outside Git.

---

## 7. Weekly operating system for you

At 12–15 hours per week:

| Block | Hours | Purpose |
|---|---:|---|
| Concepts | 3 | book/docs/lecture plus handwritten explanation |
| Miniature implementation | 3 | implement the mechanism in isolation |
| JARVIS integration | 4–5 | production code and error handling |
| Tests and measurement | 2 | automated tests, benchmark, failure injection |
| Documentation/demo | 1–2 | ADR, learning log, short video, retrospective |

Use three recurring sessions:

- **Learn:** derive or explain the concept without copying code.
- **Build:** code with documentation available, but no generated implementation pasted into the repository.
- **Defend:** close the editor and explain the design, alternatives, and failure modes aloud.

### Your rules about AI assistance

Since the point is to learn and code it yourself:

- AI may quiz you, review your explanation, generate adversarial test cases, or point to documentation.
- AI should not generate production feature code for you.
- When stuck, ask for a hint ladder: concept → pseudocode → one failing example → only then a minimal code fragment.
- Re-type and explain any borrowed fragment; record source and license when appropriate.
- Every Sunday, choose one module and explain it from a blank page.

### Definition of done for every issue

- Acceptance criteria are written before coding.
- Happy path and at least two failure paths are tested.
- Logs contain correlation IDs but no secrets.
- Permissions and data retention are considered.
- Performance is measured if the code touches audio, models, disk, network, or subprocesses.
- Documentation explains why, not merely what.
- The feature works after a clean restart.

---

## 8. Curriculum checklist

### Python and software engineering

- [ ] typing, protocols, generics, dataclasses
- [ ] iterators/generators/context managers/decorators
- [ ] exceptions and domain error design
- [ ] packages, dependency locks, configuration
- [ ] testing, mocks, fixtures, properties, fuzzing
- [ ] profiling, structured logging, observability
- [ ] concurrency, multiprocessing, `asyncio`, cancellation

### Core CS

- [ ] processes, threads, signals, IPC, files, permissions
- [ ] TCP/IP, DNS, HTTP, WebSockets, TLS concepts
- [ ] SQL, indexes, transactions, migrations, query plans
- [ ] queues, caches, pub/sub, state machines, DAGs
- [ ] authentication, authorization, capabilities, sandboxing
- [ ] retries, idempotency, timeouts, backpressure, recovery

### Math and ML

- [ ] linear algebra and tensor shapes
- [ ] probability, likelihood, entropy, cross-entropy
- [ ] gradients, chain rule, optimization
- [ ] classical classification and evaluation
- [ ] dense nets, CNNs, RNN/LSTM concepts
- [ ] embeddings, attention, transformers
- [ ] data splits, leakage, calibration, ablation
- [ ] inference, quantization, memory/performance tradeoffs

### Speech and vision

- [ ] sampling, PCM, FFT, spectrogram, Mel/MFCC
- [ ] VAD, wake word, ASR/CTC, TTS/vocoder concepts
- [ ] WER and streaming latency
- [ ] image transforms, OCR, coordinates, confidence
- [ ] capture consent, redaction, and retention

### Product and research practice

- [ ] requirements and scope control
- [ ] experiment tracking and benchmark design
- [ ] model/dataset cards and licensing
- [ ] accessibility and fallback paths
- [ ] threat modeling and privacy controls
- [ ] demo design and technical communication

---

## 9. Test strategy

### Testing pyramid

1. **Unit:** parsing, schemas, policies, DAG validation, retrieval scoring, tokenization, masking.
2. **Contract:** every adapter and tool conforms to its interface with fake implementations.
3. **Integration:** database + core, audio + router, planner + tools, UI + event stream.
4. **End-to-end:** fixed commands and flagship workflows from input through audit/output.
5. **Security:** traversal, injection, escalation, malformed model output, prompt injection.
6. **Performance:** median/p95 latency, throughput, memory, model load, long-running stability.
7. **Human evaluation:** understandable clarification, correct permission prompt, useful recovery.

### Golden benchmark discipline

- Freeze evaluation data before tuning.
- Never train on test utterances.
- Version benchmark inputs and expected outcomes.
- Save raw results and environment metadata.
- Report failures and confidence intervals where meaningful.
- A demo is not a benchmark; a benchmark is not proof of universal safety.

---

## 10. Risk register

| Risk | Early warning | Response |
|---|---|---|
| Scope explosion | more integrations, core tests unfinished | enforce V1 exclusions and five flagship workflows |
| Python learning stalls | tutorials without commits | every concept ends in a tiny executable artifact |
| Training is too slow | smoke model cannot finish promptly | reduce context, dimensions, layers, dataset; validate pipeline first |
| Laptop thermals/storage | throttling, crashes, low disk | monitor, checkpoint, cap runs, clean datasets, never promise a parameter target blindly |
| Weak wake word | high false positives | more hard negatives, session-separated data, threshold tuning, retain push-to-talk |
| LLM hallucinates actions | invalid or unsafe plans | schema validation, allowlisted tools, deterministic policy, confirmations |
| Memory becomes creepy/wrong | unexplained facts or stale recall | provenance, confidence, explicit retention, view/edit/forget |
| Security postponed | raw shell/filesystem convenience | implement policy in Phase I and attack it every phase |
| UI consumes the project | animations before reliability | UI begins only after core, voice, model, memory, and tools exist |
| Dependency churn | abandoned package blocks build | adapter interfaces, pinned versions, quarterly replacement review |
| “Free” service changes | cloud quota/API disappears | core offline; cloud connector is optional and replaceable |
| Burnout during college | two missed weeks, huge backlog | cut stretch goals, keep weekly artifact, use recovery protocol below |

### Recovery protocol after falling behind

Do not compress two missed weeks into one. Instead:

1. Freeze new features.
2. List the last passing gate and current broken invariant.
3. Drop stretch goals first.
4. Finish one vertical slice with tests.
5. Move the release date only if core gates still cannot fit; never fake completion.

Priority under time pressure:

**Policy/security → deterministic tools → voice → memory → planner → UI → own LLM experiment → vision → extra integrations.**

Your own LLM remains a required learning artifact, but its parameter count and conversational quality are adjustable. Safety and working integration are not.

---

## 11. Milestone demonstrations

| End of | Demonstration sentence |
|---|---|
| Month 1 | “I built the typed event, process, parsing, and testing foundations.” |
| Month 2 | “JARVIS safely executes deterministic local commands with permissions.” |
| Month 3 | “My locally running voice pipeline detects, transcribes, routes, and replies.” |
| Month 4 | “I implemented backprop, attention, a tokenizer, and transformer components.” |
| Month 5 | “I trained and evaluated my own small language model from random weights.” |
| Month 6 | “JARVIS has inspectable memory and a capability-secured plugin system.” |
| Month 7 | “It validates and executes multi-step plans with recovery.” |
| Month 8 | “The desktop UI exposes plans, permissions, memory, tools, and perception.” |
| Month 9 | “JARVIS 1.0 is benchmarked, attacked, documented, reproducible, and demo-ready.” |

---

## 12. The first 72 hours

Do only this; do not download a giant model yet.

### Day 1

- Create the repository and issue board.
- Copy this plan into the repository.
- Write the one-paragraph product contract and V1 exclusions in the README.
- Inventory hardware and verify Python, Git, compiler, microphone, and GPU visibility.
- Create a virtual environment and first test.

### Day 2

- Implement a typed `CommandResult` and structured logger.
- Implement `jarvis doctor` with sanitized system information.
- Write tests for missing tools, timeouts, and output truncation.
- Record a two-minute explanation of process vs thread and why shell strings are unsafe.

### Day 3

- Implement the REPL loop with `help`, `exit`, and `status`.
- Add one read-only system-status tool through a registry, not a hardcoded `if` in the REPL.
- Write the first ADR: “Why models may propose but never execute.”
- Tag `v0.0.1`.

The first victory is not “Jarvis answered a question.” It is: **one command traveled through an architecture you understand, was authorized, executed, observed, tested, and audited.**

---

## 13. Final viva/recruiter questions you must be able to answer

- Why is JARVIS a distributed/event-driven system even when it runs on one laptop?
- What happens from microphone sample to executed tool call?
- How did you prevent the model from gaining ambient authority?
- How does cancellation propagate through audio, planner, and subprocesses?
- What does idempotency mean for a tool, and why does retry safety depend on it?
- How did you split wake-word and intent data to avoid leakage?
- Derive scaled dot-product attention and explain the causal mask.
- How does your BPE tokenizer train and round-trip Unicode text?
- How many parameters does `DakshLM` have, and where do they come from?
- Why does validation loss diverge from training loss, and what did you change?
- How is memory different from conversation history?
- How do you prevent stale or inferred memories from becoming facts?
- Why SQLite, and when would you migrate away?
- What attacks did your prompt-injection suite include?
- Which parts did you implement yourself, which did you reuse, and why?
- Show one failed experiment and explain what it taught you.
- What does JARVIS do when the internet, microphone, model, database, or plugin fails?
- What are the five biggest limitations of V1.0?

If you can answer these with code, measurements, and failed experiments—not slogans—you will have built a project far stronger than a generic “AI assistant.”

---

## 14. Official references to anchor implementation

Use primary documentation and source repositories; re-check versions when each phase begins.

- [Python documentation](https://docs.python.org/3/)
- [PyTorch documentation and installation](https://pytorch.org/get-started/locally/)
- [`llama.cpp` official repository](https://github.com/ggml-org/llama.cpp) — local C/C++ LLM inference, quantization, CUDA and hybrid execution.
- [`whisper.cpp` official repository](https://github.com/ggml-org/whisper.cpp) — local speech recognition, quantization, VAD, CPU/GPU and desktop platform support.
- [SQLite official documentation](https://www.sqlite.org/docs.html)
- [OWASP Application Security Verification Standard](https://owasp.org/www-project-application-security-verification-standard/)
- [NIST AI Risk Management Framework](https://www.nist.gov/itl/ai-risk-management-framework)
- [React documentation](https://react.dev/)
- [TypeScript documentation](https://www.typescriptlang.org/docs/)
- [Tauri documentation](https://tauri.app/)

The local TTS ecosystem changes faster than the architecture. Keep TTS behind an adapter and select a maintained offline implementation at Week 11 after checking its current repository, platform support, voice license, and redistribution terms.

---

## 15. Release oath

JARVIS 1.0 will not pretend to understand what it does not understand. It will not claim an action succeeded until it verifies the postcondition. It will not hide which memory, model, or tool influenced a result. It will ask before crossing a meaningful boundary. Its limitations will be documented as carefully as its capabilities.

That is how this becomes **your system**, not a cinematic interface taped onto somebody else’s model.
