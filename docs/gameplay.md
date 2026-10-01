# Luật chơi

Mọi con số bên dưới nằm trong `src/core/constants.ts`. Đơn vị: 1 ô (tile) = 16px = **1 mét** điểm; game chạy cố định 60 frame/giây.

## 1. Điều khiển: một thao tác duy nhất
- **Click chuột trái hoặc phải, nhấn Space / ↑ / W / Enter, hoặc chạm màn hình** đều là cùng một thao tác "nhấn".
- **Tạm dừng**: nút ⏸ ở góc trên phải (thế chỗ ảnh nhân vật trong lúc chơi), hoặc phím **Esc / P**. Khi đang dừng, nhấn bất kỳ đâu (hoặc Esc / P) để chơi tiếp.
- **Lần nhấn đầu tiên chỉ để bắt đầu** lượt chơi, không làm Mario nhảy.
- Mario **tự chạy** (`RUN_SPEED` = 1,35 px/frame ≈ 5 ô/giây lúc đầu). Không có nút trái/phải. Tốc độ **tăng dần sau mỗi cột cờ** (mục 8).
- **Mức nhảy cố định** (người dùng chốt, không có kiểu giữ lâu nhảy cao):
  - Đỉnh nhảy khoảng **4,8 ô**, bằng cú nhảy khi đang chạy của Super Mario Bros gốc (nhảy tại chỗ ở bản gốc khoảng 4 ô); bay trên không khoảng **3,6 ô** theo chiều ngang (`JUMP_VELOCITY` 7,4, `GRAVITY` 0,34).
  - Có 2 khoảng dung sai cho dễ chơi: nhấn sớm tối đa 6 frame trước khi chạm đất thì Mario vẫn nhảy ngay khi đáp (*jump buffer*); vừa rời mép tối đa 5 frame vẫn nhảy được (*coyote time*).
- Khi có **hoa lửa**, mỗi lần nhấn vừa nhảy (nếu đang đứng trên đất) vừa **bắn 1 cầu lửa** (tối đa 2 quả cùng lúc).

## 2. Chuyển động và camera
- Chạm **cạnh bên** của ống, tường, bậc thang thì Mario **quay đầu**, cả khi đang ở trên không.
- **Ngoại lệ (user chốt)**: đang ở trên không mà đụng vào **cạnh bên của khối lơ lửng** (hàng gạch trên trời) thì **không quay đầu**: Mario rơi xuống qua khối đó và chạy tiếp theo hướng đang chạy. Khi đang đứng trên đất thì đụng gì cũng quay đầu.
- **Mép trái màn hình là một bức tường**: chạy ngược tới đó thì Mario quay đầu lại.
- Camera **chỉ tiến, không bao giờ lùi**. Khi đi về bên phải, Mario luôn đứng ở khoảng 30% chiều rộng màn hình tính từ mép trái.
- Quái và vật phẩm cũng quay đầu khi gặp vật cản. Rùa đỏ còn tự quay đầu ở mép vực; goomba và rùa xanh thì rơi khỏi mép.

## 3. Khối
| Khối | Mario nhỏ đội từ dưới | Mario lớn / lửa đội từ dưới |
|---|---|---|
| Gạch thường | Nảy lên | **Vỡ** |
| Gạch nhiều coin (`C`) | Mỗi lần đội ra 1 coin; tối đa 10 lần hoặc trong 4 giây kể từ lần đầu, sau đó thành khối trơn | Như bên trái |
| Khối `?` coin | 1 coin, sau đó thành khối trơn | Như bên trái |
| Khối `?` vật phẩm (`M`) | Ra **nấm** | Ra **hoa lửa** |
| Gạch sao (`*`) | Ra **sao** | Như bên trái |
| Bậc thang, ống nước, tường | Rắn chắc, đứng lên được | Như bên trái |
| **Bục mây** (`=`) | **Một chiều**: nhảy xuyên từ dưới lên, đáp và đứng được trên mặt; đi ngang không bị chặn | Như bên trái |
| Hố ở mặt đất | Rơi xuống là **chết**, bất kể đang ở trạng thái nào | Như bên trái |

Đội một khối thì **quái đang đứng trên khối đó bị hạ**, còn vật phẩm trên đó bị nảy lên.

## 4. Vật phẩm
Vật phẩm trồi ra từ khối trong khoảng nửa giây, sau đó **chạy về phía trước** (sang phải) và gặp vật cản thì quay đầu.
- **Nấm**: Mario nhỏ → lớn (cao 2 ô). Lớn lên theo chiều từ dưới lên; nếu trên đầu bị vướng thì chờ tới khi có chỗ.
- **Hoa**: Mario lớn → lửa. Nếu Mario đang nhỏ thì ăn hoa chỉ thành lớn, giống game gốc.
- **Sao**: vừa chạy vừa nảy. Ăn vào thì **bất tử 10 giây**: người nhấp nháy đổi màu, chạm quái nào là quái đó chết.

**Vật phẩm đứng yên trên cao:** một số sao / hoa / nấm nằm sẵn trên mặt gạch hoặc bục mây lơ lửng; chạm vào là ăn, không cần đội khối. Muốn ăn phải nhảy lên gạch, có chỗ phải leo 2–3 bậc (gạch và mây) mới tới được sao.

## 4b. Băng (biome tuyết)
- Mặt đất trong biome tuyết là **băng**: Mario chạy nhanh gấp **1,3 lần** (`ICE_SPEED_FACTOR`).
- Đụng tường trên băng thì Mario quay đầu nhưng **trượt chân**: trong 24 frame (`ICE_GRIP_FRAMES`, khoảng 0,4 giây) chỉ chạy được **nửa tốc độ**. Nhảy trong lúc đó thì cú nhảy ngắn hơn.
- Rời băng (nhảy, rơi) thì Mario giữ nguyên tốc độ trên không; đáp xuống đất thường thì về tốc độ bình thường.

## 5. Quái
- **Goomba**: đạp lên đầu thì bẹp.
- **Rùa (xanh/đỏ)**:
  - Đạp lên thì chui vào **mai**.
  - Chạm hoặc đạp vào mai đang nằm yên thì **đá mai đi**. Mai trượt nhanh (3,2 px/frame), dội tường, **hạ mọi quái trên đường**, và có thể dội ngược lại làm Mario bị thương. Mario được miễn nhiễm 12 frame ngay sau cú đá.
  - Đạp lên mai đang trượt thì mai dừng.
  - Mai nằm yên 5 giây thì rùa chui ra lại.
- Hai quái chạm nhau thì bật ra hai phía.
- **Rùa nhảy (Paratroopa, có cánh)**: nảy liên tục theo đường đi. Đạp lần 1 thì rụng cánh thành rùa thường, đạp lần 2 mới thành mai.
- **Rùa đỏ bay**: lơ lửng lên xuống tại chỗ, đạp lên cũng rụng cánh.
- **Mây gai** và **chim**: chỉ ở biome mây (mục 8b).
- **Đạn Bill (Bullet Bill)**: bắn từ **trụ bắn đạn**, bay ngang (chuyển hướng về phía người chơi). Đạp lên đạn thì hạ được; chạm ngang thì bị thương. Trụ không bắn khi người chơi đứng sát (dưới 3 ô) và tối đa 3 viên cùng lúc.
- **Spiny** (rùa gai đỏ): đi như goomba nhưng **không đạp được**, đạp lên là bị thương. Hạ bằng cầu lửa, mai rùa, sao hoặc đội khối. Hay gặp ở sa mạc và lâu đài.
- **Cây ăn thịt** trong ống (từ tier 1): trốn trong ống → trồi lên → ở ngoài khoảng 1 giây → thụt xuống. **Không trồi lên khi Mario đứng trên hoặc sát bên ống**, nên đứng trên miệng ống luôn an toàn; nguy hiểm là lúc tới nơi mà cây đang ở ngoài. Không đạp được; hạ bằng cầu lửa hoặc sao. Chưa nhảy thì Mario đụng ống, quay đầu, chạy về mép trái rồi quay lại: đó chính là cách "chờ" trong game một nút.
- **Fire bar** (chỉ ở lâu đài): chuỗi 5 quả cầu lửa quay quanh một khối rỗng lơ lửng. Tầm với dừng cách mặt đất khoảng 2¼ ô, nên **chạy dưới đất luôn an toàn**, chỉ **nhảy xuyên qua vòng quay** mới nguy hiểm. Không hạ được, kể cả khi có sao (sao chỉ giúp không bị thương).
- Quái đi theo nhóm 1–3 con.
- Quái chỉ bắt đầu hoạt động khi sắp đi vào màn hình.
- **Đạp** được tính khi Mario đang rơi xuống và chân chạm vào vài pixel trên cùng của quái. Đạp xong Mario nảy lên, và thế giới **khựng lại 3 frame** (hit-stop) cho cú đạp "có lực". Lần nhấn trong lúc khựng không bị mất, nó được thực hiện ngay sau đó.
- **Chuỗi đạp (combo)**: đạp liên tiếp nhiều quái mà chưa chạm đất thì mỗi lần sau được **gấp đôi** điểm: 10 → 20 → 40 → 80 (tối đa ×8). Chạm đất là reset.

## 6. Bị thương và chết
- Đang **lớn hoặc lửa** mà chạm quái (không phải đạp) thì **teo về nhỏ**, rồi nhấp nháy bất tử 2 giây.
- Đang **nhỏ** mà chạm quái thì **chết**.
- Rơi xuống hố thì chết ngay (ở lâu đài đáy hố là dung nham, nhưng luật vẫn vậy).
- **Mỗi lượt chỉ có 1 mạng.** Khi chết: hoạt cảnh chết → màn **GAME OVER** (tỉ số, điểm cao nhất, dòng tóm tắt *mét · xu · quái · cột cờ*, "NEW RECORD!") → khoảng 0,6 giây không nhận input → nhấn để về màn tiêu đề (màn chơi mới, bảng tên game hiện ở giữa) → nhấn tiếp để chạy, bảng trượt lên khỏi màn hình.

## 6b. Cột cờ (mốc định kỳ)
- Cột cờ đầu tiên xuất hiện ở khoảng **200m**, sau đó cứ **450m** có một cột (`FIRST_FLAG_TILES`, `FLAG_INTERVAL_TILES`). Mỗi cột cờ cũng là chỗ kết thúc một biome, nên đây chính là độ dài mỗi biome. Lối vào / ra khỏi biome mây thay cột cờ bằng bậc lên mây / dây leo (mục 8b).
- Bố cục: bậc thang **cao 5 ô** (cao hơn mức vật cản thường là 4 ô) → 2 ô đất → cột cờ cao 9 ô, có một khối đế.
- **Chạm cột ở bất kỳ độ cao nào là đu cờ**, kể cả khi nhảy vượt quá đỉnh cột (lúc đó tính như đu ở đỉnh), nên không bao giờ bỏ lỡ cột cờ. Chạy dưới đất đâm vào khối đế cũng tính là đu ở chân cột.
- **Điểm thưởng theo độ cao chân lúc đu** (tính bằng ô trên mặt đất):

  | Độ cao | ≥ 8 | ≥ 6 | ≥ 4 | ≥ 2 | thấp hơn |
  |---|---|---|---|---|---|
  | Điểm | 100 | 50 | 30 | 20 | 10 |

  Nhảy ngay từ mép bậc trên cùng thì đu được tới đỉnh cột.
- Trong lúc trượt xuống, thế giới đứng yên và mọi input bị bỏ qua. Trượt xong **không vào lâu đài** mà nhảy sang phía bên kia cột rồi **chạy tiếp**. Mỗi cột chỉ tính điểm một lần.
- Qua mỗi cột cờ: **tốc độ tăng một bậc** và **sang biome kế tiếp** (mục 8). Màn hình hiện tên biome và "SPEED UP!" trong khoảng 2,5 giây.

## 7. Điểm (người dùng chốt)
`điểm = quãng đường (m) + 10 × coin + 10 × quái bị hạ + điểm thưởng (cột cờ + phần gấp đôi của chuỗi đạp)`
- **Quãng đường** tính theo vị trí xa nhất từng tới, nên chạy qua chạy lại không được cộng thêm.
- **Quái bị hạ** gồm mọi cách hạ do Mario gây ra: đạp, sao, cầu lửa, mai bị đá, đội khối. Đạp rùa thành mai đã tính 1 lần; mai đó bị hạ sau này thì tính thêm lần nữa.
- **Điểm cao nhất** lưu cả lượt `{score, distance, coins}` của lượt chơi đạt điểm cao nhất (mặc định lưu localStorage).

## 8. Độ khó (user chốt: chạy lâu phải có thử thách mới)
Độ khó tăng theo ba trục:
1. **Tier** (0 → 3): cứ mỗi 250m mở thêm một tier. Tier vừa mở có trọng số chọn cao gấp đôi, nên đi xa thì các chunk khó xuất hiện nhiều hơn.
2. **Tốc độ**: mỗi cột cờ (hoặc bậc lên mây / dây leo) cộng `SPEED_STEP` = 0,135 px/frame (+10%), tối đa 5 bậc (`MAX_SPEED_LEVEL`), tức 1,35 → 2,025 (**150%**). Tắt được bằng option `speedUp: false`.
3. **Biome**: mỗi cột cờ chuyển sang vùng mới, theo vòng **đồng cỏ → sa mạc → tuyết → lâu đài → trên mây → đồng cỏ…** (cột cờ đầu ở 200m, sau đó cứ 450m một cột). Mỗi biome có màu sắc, phong cảnh, thời tiết **và luật riêng**:

| Biome | Hình ảnh | Luật / thử thách |
|---|---|---|
| Đồng cỏ | trời xanh, đồi, cây (như cũ) | bộ chunk cổ điển; cây ăn thịt trong ống từ tier 1 |
| Sa mạc | kim tự tháp, xương rồng, cát bay | nhiều hố và trụ bắn đạn hơn, ít ống hơn; khoảng nửa số goomba thành **Spiny** |
| Tuyết | núi phủ tuyết, thông, tuyết rơi | mặt đất là **băng** (mục 4b); nhiều bục mây, bậc thang, tường |
| Lâu đài | bóng lâu đài, tàn lửa bay, **dung nham** dưới hố | chunk **fire bar**; nhiều tường và trụ bắn đạn; một phần goomba thành Spiny |
| Trên mây | trời xanh, dải mây phía xa, nền là **mây**, khối vàng | không có ống; nhiều hố giữa các đám mây và bục mây; nửa số goomba thành **mây gai**, thỉnh thoảng có **chim** bay tới |

### 8b. Lên mây và xuống lại
- **Lên mây** (cuối lâu đài): thay cho cột cờ là **3–5 bậc lơ lửng**, mỗi bậc cao hơn, cách nhau 1–2 ô; bậc cao nhất nằm ở 9 ô trên mặt đất, sát một bức tường cao bằng nó. Tầng mây lơ lửng phía trên bên phải ngay từ đầu. **Đáp lên bậc cao nhất** thì thế giới dừng lại và màn hình **trượt lên** khoảng 1 giây, cho tới khi tầng mây thành nền dưới cùng. Nhảy hụt thì Mario chạy dưới các bậc, đụng tường, quay lại và thử tiếp. Lên tới mây được **+50 điểm** và tăng tốc một bậc.
- **Trên mây**: chơi như mặt đất, nhưng rơi xuống khe giữa các đám mây là chết. **Mây gai** đi tuần chậm trên nền mây và không đạp được, phải nhảy qua (hạ được bằng cầu lửa, mai rùa, sao). **Chim** bay ngang về phía người chơi ở tầm của cú nhảy, có nhấp nhô; đạp được.
- **Xuống đất** (cuối biome mây): hai bậc mây, rồi một **dây leo** treo từ đỉnh màn hình xuống, xuyên qua tầng mây tới tận mặt đất bên dưới. **Phải nhảy chạm dây** (từ bậc mây, hoặc nhảy đúng lúc từ nền mây). Chạm thì được điểm theo độ cao như cột cờ, tầng mây **trôi lên** và lộ ra mặt đất đồng cỏ, Mario trượt xuống dây rồi chạy tiếp (tăng tốc một bậc). Nhảy hụt thì bức tường mây phía sau dây đẩy Mario quay lại để thử tiếp.
- Trong lúc chưa chuyển tầng, quái ở tầng bên kia đứng yên và không chạm được Mario.

Mọi chunk ở mọi biome đều được solver chứng minh vượt qua được ở **cả tốc độ đầu lẫn tốc độ tối đa** ([level-design.md](level-design.md)). Thứ tự hoặc chỉ giữ một biome: option `biomes` ([integration.md](integration.md)).

## 9. Nhân vật
- Có sẵn 17 nhân vật: **Mario, Luigi, Peach, Zelda, Daisy, Rosalina, Luffy, Zoro, Sanji, Nami, Robin, Usopp, Chopper, Franky, Brook, Jinbe, Blondie**. Mario và Luigi dùng chung dáng; Peach, Zelda, Daisy, Rosalina dùng chung dáng công chúa; 9 thành viên băng Mũ Rơm (Chopper khi lớn biến thành dạng Heavy Point) và Blondie có dáng riêng. Khác nhau ở sprite và bảng màu.
- Bảng chọn tự chia hàng đều (các hàng chênh nhau tối đa 1 thẻ, không bao giờ để một thẻ lẻ ở hàng cuối) và chuyển sang thẻ nhỏ khi màn hình thấp (điện thoại).
- Mỗi nhân vật có đủ bản nhỏ, lớn, lửa và bộ màu nhấp nháy khi ăn sao. Luật chơi và kích thước va chạm như nhau cho mọi nhân vật.
- **Ảnh nhân vật ở góc trên bên phải**: bấm vào đó để mở bảng chọn. Chỉ bấm được **trước khi bắt đầu** hoặc ở **màn GAME OVER**. Khi đang chơi, ảnh bị làm mờ và bấm vào đó chỉ có tác dụng như một lần nhảy bình thường.
- Khi bảng chọn đang mở, lần nhấn tiếp theo chỉ dùng cho bảng: bấm vào thẻ thì chọn nhân vật đó; bấm ra ngoài hoặc nhấn Space thì đóng bảng. Lần nhấn đó không làm bắt đầu game.
- Nhân vật đã chọn được lưu cùng chỗ với điểm cao nhất (localStorage `<storageKey>:character`).

## 9b. Cảm giác chơi
- **Rung màn hình** nhẹ khi phá gạch, bị teo nhỏ, chết, đá mai, đu cờ. Chỉ phần thế giới rung, HUD đứng yên.
- **Bụi** khi đáp đất mạnh, khi quay đầu, và khi Mario trượt chân trên băng.
- **Thời tiết** theo biome (tuyết, cát, tàn lửa) là hạt trang trí, không ảnh hưởng luật chơi.
- Người dùng bật *reduce motion* trong hệ điều hành thì tự tắt rung và thời tiết (option `reducedMotion`).
- Toàn bộ chữ trong canvas dùng **font pixel** (5×7 có viền tối cho mọi chữ trên nền trời; 3×5 không viền chỉ cho credit và dòng tóm tắt trên panel GAME OVER, vì ở cỡ đó viền làm nhoè chữ). Chuỗi có ký tự font không có (ví dụ tiếng Việt có dấu do app truyền vào `labels`) thì tự chuyển sang font hệ thống, không bị mất chữ.

## 10. Credit
Góc trên trái, ngay trên điểm số, có credit tác giả (mặc định **SONTH87**, dẫn tới GitHub). Giống ảnh nhân vật, credit chỉ bấm được **giữa các lượt chơi**. Khi đang chơi, bấm vào đó chỉ là một lần nhảy, để không lỡ tay mở tab mới giữa chừng.
