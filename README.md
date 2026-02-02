<p align="center">
  <a href="https://shittycodingagent.ai">
    <img src="https://shittycodingagent.ai/logo.svg" alt="pi logo" width="128">
  </a>
</p>
<p align="center">
  <a href="https://discord.com/invite/3cU7Bz4UPx"><img alt="Discord" src="https://img.shields.io/badge/discord-community-5865F2?style=flat-square&logo=discord&logoColor=white" /></a>
  <a href="https://github.com/badlogic/pi-mono/actions/workflows/ci.yml"><img alt="Build status" src="https://img.shields.io/github/actions/workflow/status/badlogic/pi-mono/ci.yml?style=flat-square&branch=main" /></a>
</p>

# Piii

> This project is a fork of https://github.com/badlogic/pi-mono (Pi).
> The goal of this fork is to experiment with the architecture and learn Pi.
> I will try to keep it reasonably up to date with upstream when possible.

> **Looking for the piii coding agent?** See **[packages/coding-agent](packages/coding-agent)** for installation and usage.

Tools for building AI agents and managing LLM deployments.

## Packages

| Package | Description |
|---------|-------------|
| **[@yolziii/piii-ai](packages/ai)** | Unified multi-provider LLM API (OpenAI, Anthropic, Google, etc.) |
| **[@yolziii/piii-agent-core](packages/agent)** | Agent runtime with tool calling and state management |
| **[@yolziii/piii-coding-agent](packages/coding-agent)** | Interactive coding agent CLI |
| **[@yolziii/piii-mom](packages/mom)** | Slack bot that delegates messages to the piii coding agent |
| **[@yolziii/piii-tui](packages/tui)** | Terminal UI library with differential rendering |
| **[@yolziii/piii-web-ui](packages/web-ui)** | Web components for AI chat interfaces |
| **[@yolziii/piii-pods](packages/pods)** | CLI for managing vLLM deployments on GPU pods |

## Contributing

See [CONTRIBUTING.md](CONTRIBUTING.md) for contribution guidelines and [AGENTS.md](AGENTS.md) for project-specific rules (for both humans and agents).

## Development

```bash
npm install          # Install all dependencies
npm run build        # Build all packages
npm run check        # Lint, format, and type check
./test.sh            # Run tests (skips LLM-dependent tests without API keys)
./pi-test.sh         # Run pi from sources (must be run from repo root)
```

> **Note:** `npm run check` requires `npm run build` to be run first. The web-ui package uses `tsc` which needs compiled `.d.ts` files from dependencies.

## License

MIT