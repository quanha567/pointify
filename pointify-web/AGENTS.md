<!--VITE PLUS START-->

# Using Vite+, the Unified Toolchain for the Web

This project is using Vite+, a unified toolchain built on top of Vite, Rolldown, Vitest, tsdown, Oxlint, Oxfmt, and Vite Task. Vite+ wraps runtime management, package management, and frontend tooling in a single global CLI called `vp`. Vite+ is distinct from Vite, and it invokes Vite through `vp dev` and `vp build`. Run `vp help` to print a list of commands and `vp <command> --help` for information about a specific command.

Docs are local at `node_modules/vite-plus/docs` or online at https://viteplus.dev/guide/.

## Built-in Commands vs Scripts

`vp <name>` runs a built-in command. `vp run <name>` runs a `package.json` script or a `vite.config.ts` task. Scripts cannot overwrite built-ins, so `vp dev` and `vp run dev` may do different things. Check `package.json` and `vite.config.ts` first, and run `vp run <name>` when the project defines a script or task with that name.

## Tool Versions

Run `vp toolchain` to show versions and relationships in the active Vite+
release. Add a tool name to select part of the graph. For example, run
`vp toolchain vite`. Use `--global` to ignore the local `vite-plus` package. Use
`vp why <package>` to show the package-manager dependency graph.

## Review Checklist

- [ ] Run `vp install` after pulling remote changes and before getting started.
- [ ] Run `vp check` and `vp test` to format, lint, type check and test changes.
- [ ] Check if there are `vite.config.ts` tasks or `package.json` scripts necessary for validation, run via `vp run <script>`.
- [ ] If setup, runtime, or package-manager behavior looks wrong, run `vp env doctor` and include its output when asking for help.

<!--VITE PLUS END-->

# Frontend Engineering Guidelines (`pointify-web`)

Tất cả các thay đổi mã nguồn trong `pointify-web` **bắt buộc** phải tuân thủ tài liệu quy chuẩn tại:
👉 [`docs/agents/frontend-coding-standards.md`](file:///d:/projects/pointify/docs/agents/frontend-coding-standards.md)
👉 [`docs/adr/0013-frontend-architecture-and-react-19-coding-standards.md`](file:///d:/projects/pointify/docs/adr/0013-frontend-architecture-and-react-19-coding-standards.md)

## Tóm tắt Quy tắc Cốt lõi:

1. **Feature Colocation**: Gom module vào `src/features/<feature>/` (api, components, hooks, types). Giữ `src/routes/` mỏng.
2. **4-Tier State**: URL State (TanStack Router) $\rightarrow$ Server State (TanStack Query) $\rightarrow$ Global Client (Zustand) $\rightarrow$ Local State (React 19).
3. **React 19 Native**: Dùng Ref-as-a-Prop (không dùng `forwardRef`) + `useImperativeHandle` cho Dialog/Sheet/Drawer; `useTransition` cho async operations; `useOptimistic` cho phản hồi tức thì.
4. **Hiệu năng & useEffect**: Cấm dùng `useEffect` cho derived data. Mọi event/realtime subscription bắt buộc có cleanup.
5. **UI & Tokens**: 100% token ngữ nghĩa Tailwind v4 (`style.css`), không hardcode mã hex. Sử dụng Shadcn UI primitives chuẩn.
6. **i18n & Domain**: 100% text UI qua `useTranslation()`, tuân thủ nghiêm ngặt danh từ trong [`CONTEXT.md`](file:///d:/projects/pointify/CONTEXT.md).
7. **Routing**: Mọi route phải có `pendingComponent` (Skeleton), `errorComponent` và `notFoundComponent` (404).

## Developer & Agent Review Checklist

- [ ] Code tuân thủ quy tắc React 19 và Colocation.
- [ ] Không có chuỗi text tĩnh hardcode (100% i18n).
- [ ] Không hardcode mã màu hex trong JSX (100% semantic class).
- [ ] Đã chạy `bun run typecheck` (`tsc --noEmit`) không có lỗi type.
- [ ] Đã chạy `bun run check` (`vp check`) qua linter/formatter.
