# Thiết kế màn chơi (chunk)

Màn chơi vô hạn được ghép theo chuỗi: **đoạn đất phẳng (3–5 ô) → chunk → đoạn đất phẳng → chunk → …**
- Chunk được chọn ngẫu nhiên theo trọng số, dùng seed (`world/generator.ts`); cùng seed thì ra cùng màn chơi.
- Không bao giờ chọn cùng một chunk hai lần liên tiếp.
- Bộ nhớ ô chỉ giữ khoảng 1 màn hình: sinh thêm phía trước camera, xóa phía sau.

## 1. Viết một chunk
Chunk nằm trong `src/world/chunks/tier{0..3}.ts`:

```ts
{
  id: 'pipe-goomba-pit',   // duy nhất
  tier: 2,                 // xuất hiện từ khi đạt 2 × 250m
  weight: 1,               // tùy chọn, mặc định 1
  rows: [
    '..........PP.........',
    '...PP.....PP.........',
    '...PP..g..PP.........',
    '...PP.....PP.........',
    '################  ###',   // DÒNG CUỐI = mặt đất; khoảng trắng = hố
  ],
}
```

**Các dòng căn theo đáy:**
- Dòng cuối luôn là hàng mặt đất; hàng đất bên dưới nó được tự thêm.
- Dòng thứ k tính từ dưới lên nằm ở độ cao k ô, tức đáy khối cách mặt đất k−1 ô.
- Khối `?` kiểu SMB nằm ở dòng thứ 4: có 3 dòng trống giữa nó và mặt đất.

| Ký tự | Nghĩa |
|---|---|
| `.` | trống |
| `#` | đất (chỉ dùng ở dòng cuối) · khoảng trắng ở dòng cuối = hố |
| `B` | gạch thường (xếp chồng lên nhau thành **tường gạch**) |
| `C` | gạch nhiều coin |
| `*` | gạch chứa sao |
| `?` | khối ? chứa 1 coin |
| `M` | khối ? chứa nấm (hoặc hoa nếu Mario đang lớn) |
| `S` | khối cứng (**bậc thang**) |
| `P` | ống nước; phần miệng và bên trái/phải tự nhận ra, ống rộng 2 ô thì viết `PP` |
| `o` | coin lơ lửng |
| `=` | **bục mây** một chiều (đứng được, nhảy xuyên từ dưới lên) |
| `$` / `%` / `&` | **vật phẩm đứng yên**: sao / hoa lửa / nấm, chạm vào là ăn, không cần đội khối. Phải nằm ngay trên một mặt đứng được (gạch, mây, ống…) và solver kiểm tra Mario đứng lên được mặt đó |
| `T` / `I` | nòng và chân trụ bắn đạn (Bill Blaster) |
| `p` / `f` | rùa có cánh nhảy (Paratroopa) / rùa đỏ bay lơ lửng lên xuống |
| `@` | **khối mây** rắn (nền và tường mây); hàng mặt đất `#` ở biome mây tự thành mây |
| `V` | **dây leo** (không rắn); chỉ dùng trong chunk dây leo |
| `c` / `b` | mây gai (không đạp được) / chim bay |
| `\|` / `^` | thân / đỉnh **cột cờ** (không rắn; chỉ dùng trong `chunks/flag.ts`) |
| `g` / `k` / `r` | goomba / rùa xanh / rùa đỏ, đứng trên ô bên dưới nó |
| `s` | Spiny (không đạp được) |
| `v` | cây ăn thịt: viết ở ô **ngay trên cột trái** của một ống 2 ô. Thường không cần viết tay, xem §2c |
| `x` | **fire bar**: ô đó thành một khối rỗng (khối đã dùng) làm trục quay. Đặt ở dòng 5 trở lên để chạy dưới đất luôn an toàn |

## 2. Giới hạn bắt buộc (suy ra từ cú nhảy cố định)
| Giới hạn | Giá trị | Lý do |
|---|---|---|
| Vật cản cao nhất | **4 ô** (`MAX_OBSTACLE_TILES`) | Đỉnh nhảy 4,8 ô; dư 0,8 ô, solver vẫn xác nhận qua được (ống 4 ô cần canh thời điểm nhảy như bản gốc) |
| Hố trống không có gì | **1–4 ô** (`MAX_OPEN_GAP_TILES`): tier 0 tối đa 2, tier 1 tối đa 3, tier 2+ tối đa 4 | Bay ngang được 3,6 ô, cộng thêm thời gian "coyote" và phần thân chồng lên mép đất |
| Hố thử thách | **5–6 ô** (`MAX_GAP_TILES` là mức chặn cứng của bộ đọc), luôn có **bục lơ lửng ở giữa**: 2–3 viên gạch (thường, ?, hoặc chứa nấm/hoa/sao), bục mây, hoặc gạch có vật phẩm đứng yên | Phải nhảy đáp lên bục rồi nhảy tiếp |
| Hàng khối lơ lửng | đáy cách đất 3 ô (dòng thứ 4) | Mario lớn (2 ô) vẫn chạy lọt bên dưới; Mario nhỏ nhảy vẫn đội tới |
| Hàng khối tầng 2 | dòng thứ 8, **lệch ngang** so với tầng 1 | Nhảy từ mặt tầng 1 lên được; nếu nằm ngay trên đầu thì bị cụng |
| Đầu và cuối chunk | phải là đất | Chỗ ghép hai chunk luôn an toàn |
| Trước mỗi vật cản | nên có ≥ 3 ô trống | Người chơi kịp phản ứng |

**Chunk cột cờ** (`chunks/flag.ts`) không nằm trong nhóm chọn ngẫu nhiên: bộ sinh màn tự chèn nó theo lịch (`FIRST_FLAG_TILES`, `FLAG_INTERVAL_TILES`). Bậc thang của nó cao 5 ô, là ngoại lệ có chủ đích với giới hạn 4 ô: mỗi bậc chỉ cao 1 ô nên vẫn leo được, và solver đã xác nhận. Tổng 5 + 9 được chọn để cả đường nhảy lên đỉnh cột vẫn nằm trong màn hình (màn hình có 11 ô phía trên mặt đất).

## 2b. Các loại chunk sinh ngẫu nhiên (`world/procedural/`)
Mỗi lần gặp là một bố cục khác nhau (số gạch, độ dài hàng, kiểu xếp coin, số ống và độ cao, độ rộng hố, hình bậc thang, cột cờ cao thấp). Chọn theo trọng số của độ khó (tier 0 → 3); hai chunk cùng loại không đứng liền nhau.

| Loại | Nội dung | Tier mở |
|---|---|---|
| `blocks` | hàng gạch / ? dài 1–8, có khi hai tầng, có nấm/hoa/sao | 0 |
| `powerups` | chỗ ăn nấm/hoa/sao chắc chắn: hàng `B?M?B`, hai cụm, `upper` thêm tầng trên có sao | 0 |
| `skyPrizes` | vật phẩm **đứng yên trên bục lơ lửng**; tier 1+ phải leo 2–3 bậc gạch/mây cao dần, vật phẩm nằm ở bậc cao nhất | 0 |
| `pipes` | 1–3 ống cao 2–4, dính sát hoặc cách 1–5 ô (ống dính nhau không hạ thấp dần) | 0 |
| `gaps` | 1–2 hố rộng 1–4 ô, coin vòng cung hoặc bục giữa hố | 0 |
| `bigGaps` | hố 5–6 ô có bục lơ lửng ở giữa | 2 |
| `gauntlet` | ống — hố — ống, không có đà, phải nhảy từ đỉnh ống | 2 |
| `firebars` | **chỉ ở lâu đài**: fire bar trên đất trống (coin làm mồi), fire bar ngay trên một bức tường thấp phải nhảy qua (nhảy hụt thì Mario dội tường quay lại, tức là "chờ"), hoặc hai fire bar liên tiếp | 0 |
| `stairs` | bậc lên / xuống / kim tự tháp / kim tự tháp xẻ đôi bằng hố, cao 2–4 | 0 |
| `wall` | tường gạch cao 2–4 dày 1–2 | 0 |
| `coins` | 6 đội hình coin khác nhau | 0 |
| `clouds` | bục mây so le, có thể trên hố | 1 |
| `cannons` | 1–2 trụ bắn đạn cao 1–3 | 1 |
| cột cờ | bậc 3–5, cột cao 6–9, cách 2–3 ô; bonus cao nhất phụ thuộc chiều cao cột | 200m, sau đó mỗi 450m |
| `ascent` (`procedural/sky.ts`) | **thay cột cờ khi biome kế tiếp là mây**: 3–5 bậc cứng lơ lửng đi lên (dòng 3 → 9), bậc trên cùng sát cột cuối của chunk là bức tường cao 9. Chunk **phải kết thúc ngay tại bức tường**: sau khi màn hình trượt lên, các cột bên trái được dời xuống 9 hàng, cột nào sau tường sẽ thành hố | — |
| `vine` (`procedural/sky.ts`) | **thay cột cờ khi rời biome mây**: 2 bục mây, dây leo treo từ dòng 11 xuống dòng 5, tường mây cao hết màn hình sau dây 4 ô | — |
| hand-made | 27 chunk viết tay trong `chunks/tier*.ts` (mix vào cho đa dạng) | theo chunk |

**Trọng số theo biome** (`BIOME_BIAS` trong `procedural/index.ts`): sa mạc ưu tiên `gaps` / `bigGaps` / `cannons` và giảm `pipes` / `clouds`; tuyết ưu tiên `clouds` / `stairs` / `wall`; lâu đài ưu tiên `wall` / `cannons`, thêm `firebars`, giảm `clouds` / `coins`.

**Quái** (`procedural/enemies.ts`): nhóm 1–3 con cách nhau 2–3 ô; goomba, rùa xanh, rùa nhảy (từ tier 1); rùa đỏ bay lơ lửng từ tier 2. Số nhóm và kích cỡ nhóm tăng theo tier.

## 2c. Trang trí theo biome (`world/biomeDecor.ts`)
Sau khi chọn, mỗi chunk (kể cả chunk viết tay) được `decorateChunk` áp biome:
- **Tuyết**: hàng mặt đất `#` thành **băng** (`Tile.Ice`).
- **Sa mạc / lâu đài**: một phần goomba thành Spiny (50% / 25%, giảm một nửa ở tier 0).
- **Mọi biome, từ tier 1**: mỗi ống 2 ô còn trống phía trên có 30–55% khả năng có cây ăn thịt.
- **Mây**: mặt đất `#` (cả 2 hàng) thành `@`; nửa số goomba thành mây gai; mỗi chunk có 35% (+10% mỗi tier) khả năng thêm một con chim ở cuối chunk. Biome mây không dùng chunk viết tay và không có ống (`BIOME_BIAS.sky`).
- **Hai tầng trong cùng 13 hàng**: tầng mây không nằm "phía trên" trong tile map mà dùng chung các hàng với mặt đất. `TileMap.edges` ghi ranh giới (`LayerEdge`). Renderer vẽ mỗi cột lệch theo tầng của nó, `systems/lift.ts` cho màn hình trượt rồi ghi lại các cột đang hiện của tầng vừa rời sang hàng của tầng mới.
- Chỉ băng làm đổi địa hình; quái thì solver bỏ qua như trước. Cột cờ chuyển sang biome mới **ngay sau cột cờ**.

## 3. Trình kiểm tra: `pnpm validate`
`scripts/validate-chunks.ts` dùng `src/tools/solver.ts` để **chạy chính hàm vật lý của game** (`stepMarioBody`), không cần giao diện:
- Duyệt mọi lựa chọn "nhảy ở frame này hay không" từ mọi trạng thái đang đứng trên đất. Khi đang bay thì chuyển động là tất định (1 nút, mức nhảy cố định), nên đồ thị trạng thái nhỏ và chạy dưới 1 giây.
- Một chunk **đạt** khi:
  1. Mario nhỏ **và** Mario lớn đều đi qua được tới cuối chunk;
  2. Mặt trên của **mọi** khối, ống, bậc thang, tường, bục mây không bị che phía trên đều có trạng thái Mario **đứng lên được**. Đây chính là yêu cầu "vật gì cũng nhảy lên được". Ô đất được miễn, vì từ vật cao rơi xuống thì Mario đáp xa hơn, bỏ qua ô đất sát chân.
- Với chunk sinh ngẫu nhiên, script lấy **`SAMPLES` mẫu (mặc định 60; `SAMPLES=400 pnpm validate` để kiểm sâu) cho mỗi loại × mỗi tier** với seed khác nhau và kiểm từng bố cục.
- Mỗi bố cục được kiểm ở **tốc độ đầu** (qua được + mọi mặt đều đứng lên được) và ở **tốc độ tối đa** (`MAX_RUN_SPEED`, chỉ cần qua được: chạy nhanh thì vượt quá một phần thưởng là chuyện bình thường).
- Kiểm theo các biome có địa hình khác nhau: **đồng cỏ** (sa mạc dùng cùng địa hình), **tuyết** (băng) và **lâu đài** (fire bar). Băng tốn khoảng 20 lần thời gian giải nên chỉ lấy ¼ số mẫu. Toàn bộ `pnpm validate` mất khoảng 3 phút.
- **Băng và solver**: hệ số băng (1,3 khi chạy, 0,5 khi trượt chân) đều là bội của 0,1 tốc độ, nên mọi vị trí nằm trên một "lưới" hữu hạn và solver vẫn duyệt hết được. Gia tốc liên tục sẽ làm số trạng thái bùng nổ, nên **đừng đổi băng sang dạng tăng tốc dần** nếu chưa sửa solver.
- Khối rỗng (`Tile.Used`, trục fire bar) được miễn kiểm tra "đứng lên được".
- Chunk `ascent` được kiểm như chunk thường (đi qua được bằng cách leo hết bậc rồi đi trên đỉnh tường). Chunk `vine` được kiểm với **đích là chạm dây leo** (`goalTile`, xét cả từng frame đang bay) thay vì ra tới mép phải, vì tường mây không cho đi tiếp. Đã chạy 12.927 bố cục với 300 mẫu/loại/tier, không có lỗi. Không chạy solver lúc đang chơi vì mỗi chunk mất khoảng 22 ms; các tham số sinh ngẫu nhiên là rời rạc và ít, nên lấy mẫu dày là đủ.
- Vật phẩm đứng yên (`$ % &`) phải nằm ngay trên một mặt đứng được, và mặt đó phải nằm trong tập ô mà Mario đứng lên được.
- Solver bỏ qua quái và coi gạch là không phá được, tức là kiểm tra theo trường hợp xấu nhất.
- `tests/level.test.ts` còn ghép 1200 cột màn chơi thật (đồng cỏ, 3 seed, có cả tốc độ tối đa) và 360 cột toàn băng, rồi chạy solver trên toàn bộ đoạn đó, để chứng minh chỗ ghép giữa các chunk cũng đi qua được.

**Sửa vật lý** (`JUMP_VELOCITY`, `GRAVITY`, `RUN_SPEED`, `SPEED_STEP`, `MAX_SPEED_LEVEL`, `ICE_*`) thì **bắt buộc** chạy lại `pnpm validate && pnpm test`.
