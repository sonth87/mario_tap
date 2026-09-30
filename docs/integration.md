# Tích hợp vào dự án khác

## 1. Cài đặt
Package giao **mã nguồn TypeScript** (`exports` trỏ thẳng vào `src/`), không có bước build.

Package là một project độc lập (có `package.json`, script, test và trang demo riêng), không phụ thuộc vào app nào. Ba cách dùng:

1. **Từ npm / git:** publish (bỏ `"private": true` trong `package.json`) hoặc cài thẳng từ git, rồi `pnpm add @sonth87/mario-runner`.
2. **Liên kết cục bộ:** `pnpm add @sonth87/mario-runner@link:../mario-runner` (hoặc `file:`), hoặc khai báo `workspace:*` nếu cả hai nằm trong một pnpm workspace.
3. **Copy mã nguồn:** chép thư mục `src/` vào app và import theo đường dẫn tương đối (package không có phụ thuộc runtime nào).

**Chạy riêng, không cần app chủ:** `pnpm install && pnpm dev` mở trang demo (cổng 5190). `pnpm build` tạo `dist/`, một site tĩnh hoàn chỉnh (HTML + 1 file JS khoảng 18 KB gzip, đường dẫn tương đối): đặt lên static host nào cũng chạy, hoặc nhúng bằng `<iframe src=".../dist/index.html">`. Mã nguồn trang demo nằm ở `demo/main.ts`, cũng là ví dụ dùng API JavaScript thuần.

**Yêu cầu:**
- Bundler hiểu TypeScript: Vite, Next (thêm `transpilePackages: ['@sonth87/mario-runner']`), esbuild…
- `tsconfig` của app bật `moduleResolution: "bundler"`.
- Với **Vite + React**, thêm `resolve.dedupe: ['react', 'react-dom']`. Package khai báo React là peer dependency, nên nếu không dedupe có thể bị nạp 2 bản React.

## 2. React
```tsx
import { MarioGame, type GameStats } from '@sonth87/mario-runner/react';

function Arcade() {
  const [stats, setStats] = useState<GameStats | null>(null);
  return (
    <MarioGame
      className="h-[360px] w-full"     // khung chứa quyết định kích thước; game lấp đầy khung
      storageKey="my-app:mario-best"
      labels={{ start: 'TAP TO START' }}
      onStats={setStats}
    />
  );
}
```
- Nên **lazy-load** (`React.lazy(() => import(...))`) để khoảng 14 KB gzip của game chỉ tải khi cần.
- Game được tạo **một lần mỗi lần mount**; unmount là dọn sạch (dừng vòng lặp, gỡ listener, đóng AudioContext).
- Prop `paused` để tạm dừng có kiểm soát; `onReady(handle)` trả về handle để điều khiển trực tiếp.

## 3. JavaScript thuần
```ts
import { createMarioGame } from '@sonth87/mario-runner';
const game = createMarioGame(hostElement, options);
game.press(); game.pause(); game.resume(); game.restart();
game.update({ muted: true, labels: { … } });
game.getStats();
game.destroy();
```
`hostElement` là khung chứa; game tự thêm một `<canvas>` vào trong và theo dõi kích thước bằng `ResizeObserver`.

## 4. Options
| Option | Mặc định | Đổi khi đang chạy? | Ghi chú |
|---|---|---|---|
| `seed` | ngẫu nhiên | — | seed của màn chơi đầu tiên; các lượt sau luôn random |
| `storageKey` | `'mario-runner:best'` | — | key localStorage lưu điểm cao nhất |
| `storage` | localStorage | — | `{ load(), save(record) }` để tự lưu (IndexedDB, server…); `null` = không lưu |
| `muted` | `false` | ✔ | |
| `showHud` | `true` | ✔ | HUD vẽ trên canvas (SCORE, coin, mét, BEST). Tắt đi nếu tự vẽ HUD từ `onStats` |
| `showPrompts` | `true` | ✔ | lời nhắc bắt đầu và màn GAME OVER |
| `scenery` | `true` | ✔ | 5 lớp nền parallax (núi, mây, đồi, cây, bụi); tắt thì chỉ còn màu trời |
| `theme` | `'day'` | ✔ | tên preset hoặc object ghi đè, xem §4b |
| `background` | theo theme | ✔ | lối tắt cho `theme.sky`: một màu, hoặc `null` để trong suốt |
| `characters` | Mario, Luigi, Peach, Zelda | — | danh sách nhân vật; nhân vật đầu tiên là mặc định (§4c) |
| `character` | nhân vật đầu tiên | — | id nhân vật ban đầu; nếu đã lưu lựa chọn trước đó thì lựa chọn đã lưu được ưu tiên |
| `credit` | SONTH87 → github.com/sonth87 | ✔ | `{ text, url? }` vẽ ở góc trên trái, ngay trên điểm số ; chỉ bấm được giữa các lượt (mở tab mới); `null` để ẩn |
| `soundButton` | `true` | ✔ | nút loa tròn ở góc trên phải, cạnh ảnh nhân vật; bấm để tắt/bật tiếng, lúc nào cũng bấm được và không tính là cú nhảy. Tắt đi nếu app có nút riêng |
| `onMutedChange(muted)` | | ✔ | gọi khi người chơi bấm nút loa trong canvas (để app đồng bộ trạng thái) |
| `characterButton` | `true` | ✔ | ảnh nhân vật ở góc trên phải của canvas, bấm để mở bảng chọn. Tắt đi nếu app tự làm nút (§4c) |
| `labels` | tiếng Anh | ✔ | `start, gameOver, restart, score, best, newRecord, metres, chooseCharacter, title, logo, mute, unmute`; `title` là dòng chữ nhỏ dưới bộ đếm xu ở giữa HUD (ví dụ tên game), mặc định để trống; `logo` là chữ trên bảng tiêu đề hiện trước mỗi lượt (trượt lên khi bắt đầu), mặc định `'SKYLINE'`, font pixel chỉ có A–Z, 0–9 và `. ! - '` (chữ thường tự viết hoa), chuỗi rỗng thì bỏ bảng, chỉ hiện lời nhắc; package không có i18n riêng, app tự dịch rồi truyền vào |
| `keyboardTarget` | `'window'` | — | `'element'` = chỉ nghe Space khi khung game đang được focus |
| `autoPauseOnHidden` | `true` | — | tạm dừng khi tab bị ẩn |
| `onStats(stats)` | | ✔ | gọi khi điểm, coin, mét, trạng thái hoặc sức mạnh thay đổi (khoảng vài lần/giây, không phải mỗi frame) |
| `onEvent(event, stats)` | | ✔ | `start, jump, coin, stomp, kick, bump, break, powerAppear, powerUp, powerDown, fireball, star, flag, die, gameOver` |
| `onGameOver(stats)` | | ✔ | gọi sau khi đã chốt điểm cao nhất; nếu vừa phá kỷ lục thì `stats.newRecord === true` |

`GameStats = { status: 'idle'|'playing'|'dying'|'over', score, distance, coins, kills, bonus (điểm cột cờ), power: 0|1|2, character (id), canChangeCharacter, best: { score, distance, coins }, newRecord }`

### 4b. Theme
```ts
theme: 'night'                                   // preset: 'day' | 'dusk' | 'night' | 'underground' | 'glass'
theme: { base: 'day', sky: '#222244' }           // ghi đè trên một preset
theme: { sky: ['#0b1020', '#3b2d6b'], trees: null, blocks: { O: '#1070A0' } }
```
| Trường | Ý nghĩa |
|---|---|
| `sky` | một màu, gradient dọc `[trên, dưới]`, hoặc `null` (canvas trong suốt, lộ nền của app) |
| `mountains` · `clouds` · `hills` · `bushes` | màu từng lớp parallax; `null` để ẩn lớp đó |
| `sceneryOutline` | màu viền và đốm của mây, đồi, bụi cỏ (kiểu NES); `null` để vẽ phẳng |
| `cloudShade` | dải màu nhạt dưới đáy mây; `null` để bỏ |
| `trees` | `{ leaf, leafLight, trunk }` hoặc `null` |
| `pipe` | `{ body, light, dark, outline }` |
| `blocks` | đổi màu sprite khối: `O` thân gạch/đất, `H` viền sáng, `K` viền tối, `Y` mặt khối ?, `W` viền khối ? |
| `cloudPlatform` · `flagpole` | màu bục mây `{ fill, shade, outline }` và cột cờ `{ shaft, ball, flag, emblem }` |
| `hud` | màu từng phần HUD: `{ credit, score, coin, best, bestLabel, distance, subtitle }` |
| `text` · `textAccent` · `textOutline` · `panel` | màu chữ lời nhắc/bảng chọn và màu nền panel |

Preset `glass` có trời trong suốt và các lớp nền bán trong suốt, hợp với khung kính hoặc nền mờ phía sau. Danh sách preset xuất ra ở `THEMES`, hàm gộp là `resolveTheme()`.

### 4c. Nhân vật
- Mặc định có 11 nhân vật (`BUILTIN_CHARACTERS`): Mario, Luigi, Peach, Zelda, Daisy, Rosalina, Toad, Link, Blondie, Wario, Waluigi. Muốn bỏ bớt, truyền `characters={BUILTIN_CHARACTERS.filter(...)}`. Nhân vật chỉ đổi được **trước khi bắt đầu hoặc ở màn GAME OVER**:
  - trong canvas: bấm ảnh nhân vật ở góc trên phải (`characterButton`);
  - từ code: `game.openCharacterPicker()` hoặc `game.setCharacter('luigi')`;
  - `stats.canChangeCharacter` cho biết lúc này có đổi được không.
- Tự làm nút riêng: đặt `characterButton={false}`, lấy ảnh bằng `characterPortraitUrl(def)` (data URL PNG, pixel sắc), bấm nút thì gọi `handle.openCharacterPicker()`. Bảng chọn vẫn do game vẽ.
- Thêm nhân vật riêng: truyền `characters={[...BUILTIN_CHARACTERS, myHero]}`, trong đó `myHero: CharacterDef = { id, name, sprites, palette, firePalette, starPalettes }`:
  - `sprites` gồm các frame nhỏ 16×16 và lớn 16×32, quay mặt sang phải, mỗi ký tự là 1 pixel, `.` là trong suốt, đúng **3** frame chạy;
  - `smallDead` là tùy chọn;
  - mỗi ký tự dùng trong sprite phải có màu trong cả 3 loại palette.

  Xem `render/sprites/princess.ts` và `render/characters.ts` làm mẫu.

## 5. Input và khả năng truy cập
- **Click chuột trái/phải, chạm và bút** chỉ được nhận **bên trong khung chứa**. Menu chuột phải bị chặn trong khung đó.
- **Space**: ở chế độ `'window'`, game chặn Space ngay từ pha capture, cả keydown lẫn keyup, trong suốt thời gian game được mount:
  - nút đang focus phía sau (ví dụ nút đóng dialog) sẽ không bị "bấm" nhầm;
  - phím tắt Space của app cũng không nhận được;
  - riêng ô nhập liệu nằm ngoài game (input, textarea, contenteditable) vẫn gõ Space bình thường.
- HUD hay nút riêng của app nên đặt **đè lên** game với `pointer-events: none` ở lớp phủ và `pointer-events: auto` ở từng nút. Như vậy click vào chỗ trống vẫn tới game, còn click vào nút thì không làm Mario nhảy.
- Khung chứa có `role="application"` và `aria-label` (prop `ariaLabel`).

## 6. Ví dụ: app có HUD và nút riêng
Một app React muốn tự vẽ HUD bằng DOM thay cho HUD trong canvas:

```tsx
import { useState } from 'react';
import { MarioGame, BUILTIN_CHARACTERS, characterPortraitUrl, type GameStats, type MarioGameHandle } from '@sonth87/mario-runner/react';

function Arcade() {
  const [stats, setStats] = useState<GameStats | null>(null);
  const [game, setGame] = useState<MarioGameHandle | null>(null);
  const face = BUILTIN_CHARACTERS.find((c) => c.id === stats?.character) ?? BUILTIN_CHARACTERS[0];
  return (
    <div style={{ position: 'relative', width: 840, height: 370 }}>
      <MarioGame
        style={{ position: 'absolute', inset: 0 }}
        showHud={false}          // app tự vẽ điểm / xu / kỷ lục từ `stats`
        characterButton={false}  // nút nhân vật của app
        soundButton={false}      // nút loa của app (dùng `muted`)
        credit={null}            // app tự hiện credit
        theme="glass"
        onStats={setStats}
        onReady={setGame}
      />
      {/* lớp phủ: pointer-events none, chỉ nút mới nhận chuột (xem §5) */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        <span>{stats?.score ?? 0}</span>
        <button
          style={{ pointerEvents: 'auto' }}
          disabled={!stats?.canChangeCharacter}
          onClick={() => game?.openCharacterPicker()}
        >
          <img src={characterPortraitUrl(face)} alt={face.name} />
        </button>
      </div>
    </div>
  );
}
```
- Lưu trạng thái tắt tiếng của app thì truyền `muted` và cập nhật theo nút của app; nếu dùng nút loa trong canvas thì nghe `onMutedChange`.
- Nên lazy-load (`React.lazy`) để phần game chỉ tải khi cần.

## 7. Bố cục HUD dựng sẵn
```
[cat] SONTH87            (coin) ×00              BEST 000000  (portrait) (speaker)
000000                  MARIO RUNNER                   0m
```
- Trên trái: credit rồi điểm. Giữa: bộ đếm xu và `labels.title`. Trên phải: kỷ lục và số mét, rồi ảnh nhân vật và nút loa.
- Thế giới cao 208 px; khung chứa nên có tỉ lệ khoảng **840 × 370** (hệ số phóng khoảng 1,8 nên chữ và nút vừa mắt). Khung tràn cả màn hình vẫn chạy nhưng mọi thứ sẽ to hơn nhiều.
- Trang demo (`demo/`) đặt game trong khung 840 × 370 kiểu kính, dùng `theme: 'glass'`.
