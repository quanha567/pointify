---
trigger: always_on
---

# Frontend Coding Standards & Architecture Guidelines (`pointify-web`)

Tài liệu quy chuẩn kiến trúc và coding cho toàn bộ mã nguồn frontend (`pointify-web`), áp dụng cho cả lập trình viên và các AI Agents khi phát triển tính năng hoặc refactor code.

---

## 1. Kiến trúc Tổ chức Thư mục & Colocation (Feature-Based Architecture)

Tuân thủ nguyên tắc **Colocation (Gom cụm theo tính năng)** kết hợp **Deep Modules (Đóng gói module)**:

```
pointify-web/src/
├── components/
│   ├── ui/                   # Shadcn UI primitives (giữ nguyên bản hoặc custom tối thiểu)
│   ├── layout/               # Global layouts (Header, Footer, Sidebar, Admin Shell)
│   ├── data-table/           # Virtual Data Table dùng chung
│   └── feedback/             # 404 NotFound, ErrorBoundary, Skeletons dùng chung
├── features/                 # Bounded contexts / Tính năng lớn
│   ├── admin/                # Feature: Quản trị hệ thống
│   │   ├── api/              # Queries, mutations, Zod DTO schemas
│   │   ├── components/       # UserFormSheet, MetricCards, BulkActionBar...
│   │   ├── hooks/            # Feature-specific hooks
│   │   └── types/            # Feature-specific types
│   ├── room/                 # Feature: Phòng Scrum Poker
│   │   ├── api/              # Realtime room listeners & actions
│   │   ├── components/       # PokerTable, CardDeck, ParticipantList...
│   │   └── hooks/
│   └── auth/                 # Feature: Xác thực & Tài khoản
├── hooks/                    # Global utility hooks (useDebounce, useMediaQuery...)
├── store/                    # Zustand stores toàn cục (useAuthStore, useThemeStore...)
├── routes/                   # TanStack Router file-based routes (mỏng, chỉ lắp ghép feature)
├── lib/                      # Firebase config, utils (cn helper), API client
├── i18n/                     # Cấu hình đa ngôn ngữ & translation resource files
└── style.css                 # Tailwind CSS v4 design tokens & CSS variables
```

### Nguyên tắc Colocation:

- **Tránh dàn trải**: Component, hooks, schema Zod, và API calls phục vụ riêng cho một tính năng phải nằm trong thư mục `src/features/<feature_name>/`.
- **Thư mục `routes/` phải mỏng**: Tuyệt đối không viết JSX dài hàng trăm dòng trong `routes/`. `routes/` chỉ làm nhiệm vụ parse query params, áp dụng guards/loaders, và render component chính từ `features/`.

---

## 2. Chiến lược Phân lớp State (4-Tier State Separation)

Phân định rạch ròi 4 tầng state để tránh duplicate state và xung đột cache:

| Tầng State                  | Công nghệ / Vị trí                                           | Mục đích sử dụng                                          | Quy tắc                                                                                           |
| :-------------------------- | :----------------------------------------------------------- | :-------------------------------------------------------- | :------------------------------------------------------------------------------------------------ |
| **1. URL / Route State**    | `TanStack Router` search params                              | Pagination, sorting, search filter, active tabs, modal ID | Bắt buộc validate bằng Zod schema qua `validateSearch`. Giữ URL có thể bookmark/share được.       |
| **2. Server / Async State** | `@tanstack/react-query` / Firebase                           | Data fetch từ backend, Firestore documents/collections    | Quản lý caching, deduping, mutations, invalidate queries. Không sao chép server data vào Zustand. |
| **3. Global Client State**  | `Zustand` (`src/store/`)                                     | Auth session, user preferences, theme, app layout toggles | Chỉ lưu dữ liệu client xuyên suốt nhiều route mà không nằm trên URL.                              |
| **4. Local UI State**       | React `useState` / `useActionState` / `@tanstack/react-form` | Form input, animated open/close drawer, hovered state     | Giữ cục bộ trong component nhỏ nhất có thể.                                                       |

---

## 3. Quy chuẩn React 19 Native & Hook Patterns

### 3.1. Encapsulated Modal/Drawer/Sheet với Ref-as-a-Prop (Thay thế `forwardRef`)

Trong React 19, `ref` là một standard prop. Mọi Dialog / Sheet / Drawer phức tạp phải đóng gói state `open/close` và dữ liệu form vào bên trong, chỉ expose interface điều khiển qua `ref` và `useImperativeHandle`:

```tsx
// ✅ Chuẩn React 19: Đóng gói state, component cha không cần quản lý isOpen/selectedItem
export interface UserFormSheetHandle {
  open: (user?: UserDto) => void;
  close: () => void;
}

interface UserFormSheetProps {
  ref?: React.Ref<UserFormSheetHandle>;
  onSuccess?: () => void;
}

export function UserFormSheet({ ref, onSuccess }: UserFormSheetProps) {
  const [open, setOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<UserDto | null>(null);

  useImperativeHandle(ref, () => ({
    open: (user) => {
      setEditingUser(user ?? null);
      setOpen(true);
    },
    close: () => {
      setOpen(false);
      setEditingUser(null);
    },
  }));

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent>{/* Form logic */}</SheetContent>
    </Sheet>
  );
}
```

_Sử dụng tại Component cha:_

```tsx
const userSheetRef = useRef<UserFormSheetHandle>(null);

// Mở tạo mới
<Button onClick={() => userSheetRef.current?.open()}>Thêm người dùng</Button>

// Mở chỉnh sửa
<Button onClick={() => userSheetRef.current?.open(row.original)}>Sửa</Button>

<UserFormSheet ref={userSheetRef} onSuccess={refetch} />
```

### 3.2. Async Transitions & `useOptimistic`

- Dùng `useTransition` hoặc React 19 Actions cho các thao tác async thay vì tạo cờ `const [loading, setLoading] = useState(false)` thủ công.
- Dùng `useOptimistic` cho các tương tác tức thời (Scrum poker vote, toggle status) để UI cập nhật ngay lập tức.

---

## 4. Tối ưu Hiệu năng Render & Vercel React Best Practices

1. **Cô lập State Biến động (Isolate Volatile State)**:
   - Các component có state thay đổi liên tục (ô tìm kiếm realtime, bộ đếm thời gian, thanh trượt) phải được tách thành component con riêng biệt để không kích hoạt re-render toàn bộ trang cha hay bảng dữ liệu lớn.
2. **Quy tắc Sử dụng `useEffect`**:
   - ❌ **CẤM** dùng `useEffect` để tính toán state phái sinh (derived data) $\rightarrow$ Tính toán trực tiếp trong render hoặc dùng `useMemo` nếu thuật toán nặng.
   - ❌ **CẤM** dùng `useEffect` để sync state từ props vào state con $\rightarrow$ Chuyển thành controlled component hoặc dùng `key` prop để reset.
   - ✅ `useEffect` chỉ được dùng để kết nối external systems (DOM event listeners, Firestore `onSnapshot`, WebSocket). Mọi subscription **bắt buộc phải có cleanup function**.
3. **Lazy Loading**:
   - Lazy load các thành phần nặng (Recharts, Modal chỉnh sửa phức tạp) bằng `React.lazy()` hoặc TanStack Router route splitting.

---

## 5. Quy chuẩn UI, Styling, Typography & Shadcn Primitives

1. **Semantic Design Tokens (Tailwind v4)**:
   - 100% sử dụng token ngữ nghĩa định nghĩa trong `src/style.css` (`bg-background`, `text-foreground`, `bg-card`, `border-border`, `bg-primary`, `text-muted-foreground`).
   - ❌ Tuyệt đối không hardcode mã màu bất biến dạng hex (ví dụ `bg-[#0f172a]`, `text-[#ffffff]`) làm hỏng Dark/Light mode.
2. **Quy chuẩn Typography & Thang Cỡ Chữ (Tuân thủ `DESIGN.md` & ADR 0021)**:
   - **Thang kích cỡ**: Page Title (`text-2xl sm:text-3xl`), Card/Modal Title (`text-lg sm:text-xl` hoặc `text-xl sm:text-2xl`), Form Label / Buttons / Tabs (`text-sm font-medium`), Body (`text-sm sm:text-base`), Helper / Muted (`text-xs sm:text-sm`), Badges/Meta (`text-xs font-medium`).
   - ❌ **CẤM font dưới 12px**: Tuyệt đối không sử dụng `text-[9px]`, `text-[10px]`, `text-[11px]`. Kích cỡ tối thiểu toàn hệ thống là `text-xs` (12px).
   - ❌ **CẤM `text-xs` cho Form Label & Main Buttons**: Nhãn nhập liệu và các nút bấm hành động chính phải đạt tối thiểu `text-sm` (14px).
   - ✅ **Tối ưu tiếng Việt**: Kết hợp `leading-normal` (1.5) hoặc `leading-relaxed` để dấu thanh điệu (sắc, huyền, hỏi, ngã, nặng) không bị dính vào dòng trên.
   - ✅ **Tương quan cỡ Icon**: Chữ 12px (`text-xs`) đi cùng icon `size-3.5`; chữ 14px (`text-sm`) đi cùng icon `size-4`; chữ 16px đi cùng icon `size-4.5`/`size-5`.
3. **Shadcn UI Integrity**:
   - Giữ các primitive trong `src/components/ui/` đồng bộ với chuẩn Shadcn / Radix / Base UI.
   - Tùy biến giao diện thông qua class Tailwind và file `style.css`; không chỉnh sửa logic cốt lõi của primitive components.
   - Luôn gộp class động qua hàm `cn(...)` (`clsx` + `tailwind-merge`).

---

## 6. Đa ngôn ngữ (i18n) & Khớp Thuật ngữ Nghiệp vụ

1. **100% i18n Translation Keys**:
   - Mọi chuỗi hiển thị trên UI (nhãn, nút bấm, placeholder, toast thông báo, validation error) đều phải qua `t('key')` từ `useTranslation()`.
   - ❌ Không hardcode text tiếng Việt/Anh trực tiếp trong mã nguồn JSX.
2. **Tuân thủ Bảng Thuật ngữ `CONTEXT.md`**:
   - Sử dụng chính xác các danh từ chuẩn trong `CONTEXT.md`:
     - _Room (Phòng)_ - không dùng session, board, bàn.
     - _Facilitator (Người điều phối)_ - không dùng host, admin phòng, chủ phòng.
     - _Participant (Thành viên)_ - không dùng user, người chơi.
     - _Deck (Bộ bài)_ & _Card (Lá bài)_ - không dùng scale, preset, ticket.
     - _Estimate (Ước lượng)_ - không dùng vote, điểm số, bình chọn.
     - _Round (Vòng ước lượng)_ - không dùng lượt chơi, ván bài.
     - _Virtual Data Table (Bảng dữ liệu ảo hóa)_ - không dùng basic table.

---

## 7. Xử lý Lỗi, Loading States, Feedback & Trang 404

1. **Trang 404 & Route Boundaries**:
   - Mọi router root và sub-layout phải có `notFoundComponent` hiển thị giao diện 404 thân thiện, có nút quay về trang chủ.
   - Mọi route phải có `pendingComponent` (Skeleton tương ứng layout, chống CLS) và `errorComponent` (thông báo lỗi + nút _Thử lại_).
2. **Feedback & Toasts**:
   - Dùng `sonner` (`toast.success`, `toast.error`, `toast.info`) cho phản hồi kết quả thao tác.
   - Mọi mutation phá hủy (Xóa người dùng, Hủy phòng, Reset vòng) bắt buộc phải có dialog xác nhận (`AlertDialog`).

---

## 8. TypeScript & Data Contracts (Zod)

1. **Cấm `any` và Type Assertions liều lĩnh**:
   - Bật chế độ Type check nghiêm ngặt của TypeScript 7 (`noEmit`).
   - Không ép kiểu `as UnknownType` khi chưa qua type guard hoặc schema parsing.
2. **Runtime Validation với Zod**:
   - Dữ liệu nhận từ API backend/Firebase hoặc URL Search Params phải được validate qua Zod schema:
     ```ts
     export const userDtoSchema = z.object({
       id: z.string(),
       email: z.string().email(),
       displayName: z.string(),
       role: z.enum(["admin", "member"]),
       status: z.enum(["active", "disabled"]),
     });
     export type UserDto = z.infer<typeof userDtoSchema>;
     ```

---

## 9. Quy ước Đặt tên (Naming Conventions)

| Đối tượng            | Quy ước                                     | Ví dụ                                                     |
| :------------------- | :------------------------------------------ | :-------------------------------------------------------- |
| **File / Thư mục**   | `kebab-case`                                | `user-form-sheet.tsx`, `use-user-query.ts`, `data-table/` |
| **React Component**  | `PascalCase`                                | `UserFormSheet`, `DataTablePagination`                    |
| **Custom Hook**      | `camelCase` (tiền tố `use`)                 | `useUserQuery`, `useDebounce`                             |
| **Type / Interface** | `PascalCase` (không prefix `I`)             | `UserDto`, `TablePaginationState`                         |
| **Zod Schema**       | `camelCase` (hậu tố `Schema`)               | `userDtoSchema`, `searchParamsSchema`                     |
| **Zustand Store**    | `camelCase` (tiền tố `use`, hậu tố `Store`) | `useAuthStore`, `useRoomStore`                            |

---

## 10. Checklist Kiểm tra Tự động trước khi Commit

Trước khi hoàn thành bất kỳ task hoặc commit nào trên frontend, phải chạy và đảm bảo vượt qua:

```bash
# 1. Type check toàn bộ dự án
bun run typecheck   # tsc --noEmit

# 2. Linting & Formatting qua Vite+ (Oxlint / Oxfmt)
bun run check       # vp check
```
