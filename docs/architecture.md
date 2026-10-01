# Kiến trúc

```
src/
├─ core/       constants.ts (mọi con số) · types.ts · options.ts (API công khai) · theme.ts (theme + preset + theme theo biome) · biome.ts · character.ts (kiểu CharacterDef) · tiles.ts (id ô + ký hiệu chunk) · rng.ts (mulberry32)
├─ world/      tileMap.ts (lưu theo cột + ranh giới biome + ranh giới tầng đất/mây, tự xóa phía sau) · chunkParser.ts · generator.ts (+ lịch cột cờ, đổi biome) · biomeDecor.ts (băng, Spiny, cây ăn thịt) · solver.ts · chunks/tier0..3.ts · procedural/ (kể cả castle.ts: fire bar, sky.ts: bậc lên mây, dây leo)
├─ physics/    body.ts (va chạm AABB với ô, tách trục X rồi Y) · marioPhysics.ts (stepMarioBody — hàm thuần; tốc độ theo body, băng)
├─ entities/   factory.ts (tạo / đổi dạng) · update.ts (di chuyển theo loại, xóa vật thể)
├─ systems/    blocks.ts (đội khối) · combat.ts (Mario ↔ vật thể, vật thể ↔ vật thể, chuỗi đạp, hit-stop) · hazards.ts (cây ăn thịt, fire bar) · lift.ts (trượt màn hình lên mây / xuống dây leo, độ lệch dọc theo tầng) · cannons.ts · marioPower.ts (lớn/nhỏ/chết) · rewards.ts (coin, hạ quái, bụi, hiệu ứng) · flag.ts (đu cờ, điểm thưởng, tăng tốc)
├─ game/       state.ts (GameState, tính điểm) · step.ts (1 frame)
├─ render/     atlas.ts (chuỗi pixel → canvas cache, theo palette) · drawScenery.ts (trời + 5 lớp parallax, mỗi hình vẽ sẵn một lần vào offscreen canvas, chuyển mờ giữa hai biome) · sceneryShapes.ts · weather.ts · drawWorld.ts (ô theo biome của từng cột, bục mây, cột cờ, dung nham) · drawActors.ts · drawOverlay.ts (HUD, lời nhắc, banner biome, PAUSED, GAME OVER) · drawUi.ts + uiLayout.ts (ảnh nhân vật / nút ⏸, nút loa, credit, bảng chọn; toạ độ dùng chung cho vẽ và bắt click) · pixelFont.ts + text.ts (font pixel 5×7 và 3×5, cache theo chuỗi, tự chuyển font hệ thống khi thiếu ký tự) · themePalettes.ts · characters.ts (17 nhân vật dựng sẵn) · portrait.ts · renderer.ts · sprites/*
├─ audio/      sfx.ts (Web Audio, mở khoá trong thao tác người dùng) · music.ts (nhạc nền tùy chọn của app, `<audio>`)
├─ engine/     createMarioGame.ts (vòng lặp, sự kiện, điểm cao nhất, tạm dừng) · api.ts (kiểu public, gộp option) · feedback.ts (rung màn hình, reduced motion) · characterPicker.ts (trạng thái chọn nhân vật + bắt click) · input.ts · viewport.ts (kể cả client → world) · storage.ts
├─ react/      MarioGame.tsx (lớp vỏ mỏng)
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
- Mỗi `step(state, pressed)` làm theo thứ tự: (hit-stop: nếu đang khựng thì chỉ giữ lại lần nhấn rồi thoát) → Mario (nhảy / chạy / đội khối / reset chuỗi đạp / bụi) → nhặt coin → lớn lên nếu đang chờ → camera → sinh màn → cập nhật vật thể → va chạm Mario ↔ vật thể → va chạm vật thể ↔ vật thể → hiệu ứng → xóa vật thể → kiểm tra rơi hố.
- Sau mỗi bước, `state.events` được phát ra: engine phát âm thanh, gọi `onEvent`, và chốt điểm cao nhất khi có `gameOver`.

## Hiển thị
- Thế giới **cao cố định 13 ô (208px)**; chiều rộng tính theo tỉ lệ khung chứa (12–40 ô).
- Canvas vẽ ở độ phân giải `round(cssHeight / 208 × devicePixelRatio)` lần kích thước thế giới, kèm `image-rendering: pixelated` để pixel luôn sắc.
- Gần ranh giới đất/mây, mỗi cột (và mọi vật thể trong cột đó) được vẽ lệch dọc theo tầng của nó (`columnOffset` trong `systems/lift.ts`). Mặt đất dưới tầng mây và đoạn dây leo xuyên xuống đất được vẽ thêm vì chúng không có trong tile map.
- Thứ tự vẽ: trời → núi (0,15) → mây (0,3) → đồi (0,5) → cây (0,7) → bụi (0,85) → thời tiết → (biome kế tiếp phủ mờ lên nếu ranh giới đang trong màn hình) → vật phẩm đang trồi và cây ăn thịt (bị khối/ống che) → ô (+ dung nham) → vật thể → nhân vật → hiệu ứng → [hết phần rung] → HUD → nút loa, ảnh nhân vật / nút ⏸ → bảng chọn hoặc lời nhắc. (Số trong ngoặc là tốc độ trôi so với camera.)
- **Input**: mọi lần nhấn đi qua `CharacterPicker.handlePress` trước; lần nào nó không dùng mới được tính là cú nhảy. Toạ độ click đổi sang toạ độ thế giới bằng `clientToWorld`, có tính phần viền đen của `object-fit: contain`.
- **Theme**: `resolveBiomeThemes()` tạo một theme cho mỗi biome (đồng cỏ = `theme` của app). `resolveTheme()` gộp preset với phần ghi đè. Engine chỉ tính lại theme khi input thực sự đổi, để atlas giữ được bản cache các khối đã đổi màu (cache theo object palette).

## Test
- `tests/*.test.ts`: vật lý, va chạm, khối, vật phẩm, điểm, bộ sinh màn (tất định, lên tier, đoạn dài vượt qua được ở tốc độ đầu/tối đa và trên băng), cột cờ (vị trí, điểm theo độ cao, chạy tiếp, chỉ tính 1 lần), bục mây một chiều, sprite và palette của nhân vật, gộp theme, `biome.test.ts` (tăng tốc, đổi biome, băng, Spiny, cây ăn thịt, fire bar, chuỗi đạp, hit-stop, theme theo biome, font pixel đủ ký tự cho nhãn mặc định), `sky.test.ts` (tốc độ tối đa 150%, lên mây, xuống dây leo, mây gai, chim, quái tầng bên kia đứng yên), và soak test: bot 20.000 frame × 3 seed, kiểm tra không lỗi và bộ nhớ không tăng.
- CI (`.github/workflows/ci.yml`) chạy `typecheck`, `test`, `validate` cho mỗi push / PR.
- Hàm `playing()` trong `tests/helpers.ts` tạo sẵn một lượt đang chơi trên đường chạy phẳng.
