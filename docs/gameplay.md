# Luật chơi

Mọi con số bên dưới nằm trong `src/core/constants.ts`. Đơn vị: 1 ô (tile) = 16px = **1 mét** điểm; game chạy cố định 60 frame/giây.

## 1. Điều khiển: một thao tác duy nhất
- **Click chuột trái hoặc phải, nhấn Space, hoặc chạm màn hình** đều là cùng một thao tác "nhấn".
- **Lần nhấn đầu tiên chỉ để bắt đầu** lượt chơi, không làm Mario nhảy.
- Mario **tự chạy** với tốc độ không đổi (`RUN_SPEED` = 1,35 px/frame ≈ 5 ô/giây). Không có nút trái/phải.
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
- **Đạn Bill (Bullet Bill)**: bắn từ **trụ bắn đạn**, bay ngang (chuyển hướng về phía người chơi). Đạp lên đạn thì hạ được; chạm ngang thì bị thương. Trụ không bắn khi người chơi đứng sát (dưới 3 ô) và tối đa 3 viên cùng lúc.
- Quái đi theo nhóm 1–3 con.
- Quái chỉ bắt đầu hoạt động khi sắp đi vào màn hình.
- **Đạp** được tính khi Mario đang rơi xuống và chân chạm vào vài pixel trên cùng của quái. Đạp xong Mario nảy lên.

## 6. Bị thương và chết
- Đang **lớn hoặc lửa** mà chạm quái (không phải đạp) thì **teo về nhỏ**, rồi nhấp nháy bất tử 2 giây.
- Đang **nhỏ** mà chạm quái thì **chết**.
- Rơi xuống hố thì chết ngay.
- **Mỗi lượt chỉ có 1 mạng.** Khi chết: hoạt cảnh chết → màn **GAME OVER** (tỉ số, điểm cao nhất, "NEW RECORD!") → khoảng 0,6 giây không nhận input → nhấn để về màn tiêu đề (màn chơi mới, bảng tên game hiện ở giữa) → nhấn tiếp để chạy, bảng trượt lên khỏi màn hình.

## 6b. Cột cờ (mốc định kỳ)
- Cột cờ đầu tiên xuất hiện ở khoảng **120m**, sau đó cứ **300m** có một cột (`FIRST_FLAG_TILES`, `FLAG_INTERVAL_TILES`).
- Bố cục: bậc thang **cao 5 ô** (cao hơn mức vật cản thường là 4 ô) → 2 ô đất → cột cờ cao 9 ô, có một khối đế.
- **Chạm cột ở bất kỳ độ cao nào là đu cờ**, kể cả khi nhảy vượt quá đỉnh cột (lúc đó tính như đu ở đỉnh), nên không bao giờ bỏ lỡ cột cờ. Chạy dưới đất đâm vào khối đế cũng tính là đu ở chân cột.
- **Điểm thưởng theo độ cao chân lúc đu** (tính bằng ô trên mặt đất):

  | Độ cao | ≥ 8 | ≥ 6 | ≥ 4 | ≥ 2 | thấp hơn |
  |---|---|---|---|---|---|
  | Điểm | 100 | 50 | 30 | 20 | 10 |

  Nhảy ngay từ mép bậc trên cùng thì đu được tới đỉnh cột.
- Trong lúc trượt xuống, thế giới đứng yên và mọi input bị bỏ qua. Trượt xong **không vào lâu đài** mà nhảy sang phía bên kia cột rồi **chạy tiếp**. Mỗi cột chỉ tính điểm một lần.

## 7. Điểm (người dùng chốt)
`điểm = quãng đường (m) + 10 × coin + 10 × quái bị hạ + điểm thưởng cột cờ`
- **Quãng đường** tính theo vị trí xa nhất từng tới, nên chạy qua chạy lại không được cộng thêm.
- **Quái bị hạ** gồm mọi cách hạ do Mario gây ra: đạp, sao, cầu lửa, mai bị đá, đội khối. Đạp rùa thành mai đã tính 1 lần; mai đó bị hạ sau này thì tính thêm lần nữa.
- **Điểm cao nhất** lưu cả lượt `{score, distance, coins}` của lượt chơi đạt điểm cao nhất (mặc định lưu localStorage).

## 8. Độ khó
Có 4 tier (0 → 3), cứ mỗi 250m mở thêm một tier. Tier vừa mở có trọng số chọn cao gấp đôi, nên đi xa thì các chunk khó xuất hiện nhiều hơn. Dù vậy mọi chunk vẫn nằm trong giới hạn nhảy của [level-design.md](level-design.md).

## 9. Nhân vật
- Có sẵn 11 nhân vật: **Mario, Luigi, Peach, Zelda, Daisy, Rosalina, Toad, Link, Blondie, Wario, Waluigi**. Mario, Luigi, Wario, Waluigi dùng chung dáng; Peach, Zelda, Daisy, Rosalina dùng chung dáng công chúa; Toad, Link và Blondie có dáng riêng. Khác nhau ở sprite và bảng màu.
- Bảng chọn tự chia hàng đều (11 nhân vật → 6 + 5) và chuyển sang thẻ nhỏ khi màn hình thấp (điện thoại).
- Mỗi nhân vật có đủ bản nhỏ, lớn, lửa và bộ màu nhấp nháy khi ăn sao. Luật chơi và kích thước va chạm như nhau cho mọi nhân vật.
- **Ảnh nhân vật ở góc trên bên phải**: bấm vào đó để mở bảng chọn. Chỉ bấm được **trước khi bắt đầu** hoặc ở **màn GAME OVER**. Khi đang chơi, ảnh bị làm mờ và bấm vào đó chỉ có tác dụng như một lần nhảy bình thường.
- Khi bảng chọn đang mở, lần nhấn tiếp theo chỉ dùng cho bảng: bấm vào thẻ thì chọn nhân vật đó; bấm ra ngoài hoặc nhấn Space thì đóng bảng. Lần nhấn đó không làm bắt đầu game.
- Nhân vật đã chọn được lưu cùng chỗ với điểm cao nhất (localStorage `<storageKey>:character`).

## 10. Credit
Góc trên trái, ngay trên điểm số, có credit tác giả (mặc định **SONTH87**, dẫn tới GitHub). Giống ảnh nhân vật, credit chỉ bấm được **giữa các lượt chơi**. Khi đang chơi, bấm vào đó chỉ là một lần nhảy, để không lỡ tay mở tab mới giữa chừng.
