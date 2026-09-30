# Kiến trúc

```
src/
├─ core/       constants.ts (mọi con số) · types.ts · options.ts (API công khai) · theme.ts (theme + preset) · character.ts (kiểu CharacterDef) · tiles.ts (id ô + ký hiệu chunk) · rng.ts (mulberry32)
├─ world/      tileMap.ts (lưu theo cột, tự xóa phía sau) · chunkParser.ts · generator.ts (+ lịch cột cờ) · chunks/tier0..3.ts · chunks/flag.ts
├─ physics/    body.ts (va chạm AABB với ô, tách trục X rồi Y) · marioPhysics.ts (stepMarioBody — hàm thuần)
├─ entities/   factory.ts (tạo / đổi dạng) · update.ts (di chuyển theo loại, xóa vật thể)
├─ systems/    blocks.ts (đội khối) · combat.ts (Mario ↔ vật thể, vật thể ↔ vật thể) · marioPower.ts (lớn/nhỏ/chết) · rewards.ts (coin, hạ quái, hiệu ứng) · flag.ts (đu cờ, điểm thưởng)
├─ game/       state.ts (GameState, tính điểm) · step.ts (1 frame)
├─ render/     atlas.ts (chuỗi pixel → canvas cache, theo palette) · drawScenery.ts (trời + 5 lớp parallax) · drawWorld.ts (ô, bục mây, cột cờ) · drawActors.ts · drawOverlay.ts (HUD, lời nhắc) · drawUi.ts + uiLayout.ts (ảnh nhân vật, nút loa, credit, bảng chọn; toạ độ dùng chung cho vẽ và bắt click) · themePalettes.ts · characters.ts (4 nhân vật dựng sẵn) · portrait.ts · renderer.ts · sprites/*
├─ audio/      sfx.ts (Web Audio, tạo lazy)
├─ engine/     createMarioGame.ts (vòng lặp, sự kiện, điểm cao nhất) · characterPicker.ts (trạng thái chọn nhân vật + bắt click) · input.ts · viewport.ts (kể cả client → world) · storage.ts
├─ react/      MarioGame.tsx (lớp vỏ mỏng)
├─ tools/      solver.ts (chỉ dùng cho validate/test, không export ra ngoài)
demo/          index.html + main.ts — bản chạy độc lập (`pnpm dev` / `pnpm build`)
```

## Chiều import
`core → world → physics → entities ↔ systems → game → render → audio → engine → react`
- `game/`, `world/`, `physics/`, `systems/`, `entities/` **không đụng tới DOM**, nên test chạy thẳng bằng `tsx` trên Node.
- Chỉ `render/`, `audio/`, `engine/` và `react/` mới dùng DOM hoặc Canvas.
- Mỗi file ≤ 300 dòng; không dùng `any`.

## Vòng lặp
- `engine/createMarioGame.ts` dùng `requestAnimationFrame` kèm bộ tích lũy thời gian, để logic luôn chạy đúng **60 bước/giây** bất kể tần số màn hình (tối đa 5 bước mỗi khung vẽ, để tab chạy nền không phải mô phỏng bù hàng giây).
- Input gom thành một cờ `pendingPress`, được tiêu thụ ở bước kế tiếp.
- Mỗi `step(state, pressed)` làm theo thứ tự: Mario (nhảy / chạy / đội khối) → nhặt coin → lớn lên nếu đang chờ → camera → sinh màn → cập nhật vật thể → va chạm Mario ↔ vật thể → va chạm vật thể ↔ vật thể → hiệu ứng → xóa vật thể → kiểm tra rơi hố.
- Sau mỗi bước, `state.events` được phát ra: engine phát âm thanh, gọi `onEvent`, và chốt điểm cao nhất khi có `gameOver`.

## Hiển thị
- Thế giới **cao cố định 13 ô (208px)**; chiều rộng tính theo tỉ lệ khung chứa (12–40 ô).
- Canvas vẽ ở độ phân giải `round(cssHeight / 208 × devicePixelRatio)` lần kích thước thế giới, kèm `image-rendering: pixelated` để pixel luôn sắc.
- Thứ tự vẽ: trời → núi (0,15) → mây (0,3) → đồi (0,5) → cây (0,7) → bụi (0,85) → vật phẩm đang trồi (bị khối che) → ô → vật thể → nhân vật → hiệu ứng → HUD → ảnh nhân vật → bảng chọn hoặc lời nhắc. (Số trong ngoặc là tốc độ trôi so với camera.)
- **Input**: mọi lần nhấn đi qua `CharacterPicker.handlePress` trước; lần nào nó không dùng mới được tính là cú nhảy. Toạ độ click đổi sang toạ độ thế giới bằng `clientToWorld`, có tính phần viền đen của `object-fit: contain`.
- **Theme**: `resolveTheme()` gộp preset với phần ghi đè. Engine chỉ tính lại theme khi input thực sự đổi, để atlas giữ được bản cache các khối đã đổi màu (cache theo object palette).

## Test
- `tests/*.test.ts`: vật lý, va chạm, khối, vật phẩm, điểm, bộ sinh màn (tất định, lên tier, đoạn dài vượt qua được), cột cờ (vị trí, điểm theo độ cao, chạy tiếp, chỉ tính 1 lần), bục mây một chiều, sprite và palette của nhân vật, gộp theme, và soak test: bot 20.000 frame × 3 seed, kiểm tra không lỗi và bộ nhớ không tăng.
- Hàm `playing()` trong `tests/helpers.ts` tạo sẵn một lượt đang chơi trên đường chạy phẳng.
