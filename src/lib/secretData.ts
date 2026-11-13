export interface BuiltinCard {
  id: string;
  type: 'FOREPLAY' | 'TRUTH' | 'DARE' | 'TRAIN';
  level: 1 | 2 | 3; // 1: Nhẹ nhàng, 2: Khiêu khích, 3: Hoang dã
  content: string;
  target?: 'BOSS' | 'SLAVE' | 'BOTH';
}

export const BUILTIN_CARDS: BuiltinCard[] = [
  // --- FOREPLAY (Dạo đầu) ---
  { id: 'f1', type: 'FOREPLAY', level: 1, content: 'Slave bịt mắt lại, Boss dùng lông vũ hoặc đầu ngón tay lướt nhẹ từ cổ xuống đùi non trong 2 phút.', target: 'SLAVE' },
  { id: 'f2', type: 'FOREPLAY', level: 1, content: 'Boss chọn một viên đá lạnh, lướt chậm rãi quanh xương quai xanh và môi của Slave.', target: 'BOSS' },
  { id: 'f3', type: 'FOREPLAY', level: 1, content: 'Slave quỳ gối trước mặt Boss, dùng ánh mắt quyến rũ nhìn thẳng và thì thầm 3 điều em thích nhất ở Boss.', target: 'SLAVE' },
  { id: 'f4', type: 'FOREPLAY', level: 2, content: 'Boss dùng dầu massage xoa bóp chậm rãi vùng lưng và hông của Slave kèm những lời thì thầm khen ngợi.', target: 'BOSS' },
  { id: 'f5', type: 'FOREPLAY', level: 2, content: 'Slave hôn từ từ từ bàn chân lên đến bắp đùi của Boss mà không được chạm tay vào người Boss.', target: 'SLAVE' },
  { id: 'f6', type: 'FOREPLAY', level: 2, content: 'Hai người nhìn sâu vào mắt nhau trong 60 giây ở khoảng cách 5cm, ai chớp mắt hoặc cười trước sẽ chịu phạt 1 mệnh lệnh.', target: 'BOTH' },
  { id: 'f7', type: 'FOREPLAY', level: 1, content: 'Boss nhẹ nhàng cắn nhẹ vào vành tai của Slave và phả hơi ấm cùng một mệnh lệnh bí mật.', target: 'BOSS' },
  { id: 'f8', type: 'FOREPLAY', level: 2, content: 'Slave cởi bỏ 1 món đồ trên người bằng răng theo chỉ định của Boss.', target: 'SLAVE' },
  { id: 'f9', type: 'FOREPLAY', level: 3, content: 'Slave bị bịt mắt và trói nhẹ hai tay sau lưng, đoán xem Boss đang dùng bộ phận hoặc vật dụng nào chạm vào người.', target: 'SLAVE' },
  { id: 'f10', type: 'FOREPLAY', level: 2, content: 'Boss dùng nến massage ấm nhỏ giọt tinh dầu lên lưng Slave và dùng bàn tay xoa dịu.', target: 'BOSS' },

  // --- TRUTH (Sự thật kín đáo) ---
  { id: 't1', type: 'TRUTH', level: 1, content: 'Vị trí nhạy cảm nhất trên cơ thể em mà mỗi lần Boss chạm vào em đều rùng mình là ở đâu?', target: 'SLAVE' },
  { id: 't2', type: 'TRUTH', level: 1, content: 'Khoảnh khắc nào em cảm thấy muốn ngoan ngoãn vâng lời Boss nhất?', target: 'SLAVE' },
  { id: 't3', type: 'TRUTH', level: 2, content: 'Một tưởng tượng táo bạo nhất về BDSM mà em từng nghĩ đến nhưng chưa dám nói với Boss là gì?', target: 'SLAVE' },
  { id: 't4', type: 'TRUTH', level: 2, content: 'Boss cảm thấy bộ trang phục hoặc tư thế nào của Slave khiến Boss mê đắm và khó kiềm chế nhất?', target: 'BOSS' },
  { id: 't5', type: 'TRUTH', level: 2, content: 'Em thích được Boss khen ngợi ngoan ngoãn hay thích bị Boss trừng phạt nhẹ nhàng hơn?', target: 'SLAVE' },
  { id: 't6', type: 'TRUTH', level: 1, content: 'Chia sẻ 1 điều Boss làm trong lúc thân mật khiến em cảm thấy được bảo bọc và yêu thương nhất.', target: 'SLAVE' },
  { id: 't7', type: 'TRUTH', level: 3, content: 'Nếu tối nay Boss cho phép em yêu cầu 1 điều điên rồ nhất mà Boss phải đáp ứng, em sẽ yêu cầu gì?', target: 'SLAVE' },
  { id: 't8', type: 'TRUTH', level: 2, content: 'Boss hãy thú nhận 1 suy nghĩ chiếm hữu mạnh mẽ nhất mà Boss từng dành cho Slave.', target: 'BOSS' },
  { id: 't9', type: 'TRUTH', level: 3, content: 'Cảm giác phục tùng và giao quyền kiểm soát cơ thể cho Boss mang lại cho em xúc cảm gì sâu kín nhất?', target: 'SLAVE' },
  { id: 't10', type: 'TRUTH', level: 1, content: 'Lời nói gợi cảm nhất của đối phương từng khiến bạn tim đập nhanh ngay lập tức là gì?', target: 'BOTH' },

  // --- DARE (Thử thách & Quyền lực) ---
  { id: 'd1', type: 'DARE', level: 1, content: 'Slave phải đeo vòng cổ choker và giữ tư thế quỳ ngoan ngoãn, xin phép Boss trước khi nói bất kỳ câu nào trong 5 phút.', target: 'SLAVE' },
  { id: 'd2', type: 'DARE', level: 2, content: 'Boss ra lệnh cho Slave tháo bỏ nội y và chỉ được mặc duy nhất chiếc áo sơ mi của Boss trong phần còn lại của buổi hẹn.', target: 'SLAVE' },
  { id: 'd3', type: 'DARE', level: 2, content: 'Slave nằm ngửa, Boss đặt một viên đá lạnh lên rốn và yêu cầu Slave thở đều, không được dịch chuyển cơ thể.', target: 'SLAVE' },
  { id: 'd4', type: 'DARE', level: 3, content: 'Slave bị còng nhẹ hai tay, Boss kích thích tùy ý trong 3 phút nhưng Slave tuyệt đối không được phát ra tiếng kêu.', target: 'SLAVE' },
  { id: 'd5', type: 'DARE', level: 2, content: 'Slave phải thì thầm vào tai Boss 5 câu khen ngợi ngọt ngào và phục tùng nhất mà em nghĩ ra.', target: 'SLAVE' },
  { id: 'd6', type: 'DARE', level: 1, content: 'Boss ôm chặt Slave từ phía sau trong 3 phút, hít hà mùi hương và xoa bóp dịu dàng.', target: 'BOSS' },
  { id: 'd7', type: 'DARE', level: 3, content: 'Slave dùng miệng cởi thắt lưng của Boss một cách chậm rãi và quyến rũ.', target: 'SLAVE' },
  { id: 'd8', type: 'DARE', level: 2, content: 'Boss đánh nhẹ vào vòng 3 của Slave 5 cái với lực vừa phải, Slave phải đếm to và cảm ơn Boss sau mỗi lần.', target: 'BOTH' },
  { id: 'd9', type: 'DARE', level: 2, content: 'Slave bò lại gần Boss, tựa đầu vào đùi Boss và xin Boss ban thưởng một nụ hôn sâu.', target: 'SLAVE' },
  { id: 'd10', type: 'DARE', level: 3, content: 'Slave bị bịt mắt hoàn toàn, Boss cho Slave nếm 3 vị khác nhau (sô-cô-la, mật ong, đá lạnh...) trên ngón tay Boss để đoán.', target: 'SLAVE' },

  // --- TRAIN (Bài tập huấn luyện SM) ---
  { id: 'tr1', type: 'TRAIN', level: 2, content: 'Bài tập kiên nhẫn: Slave quỳ gối thẳng lưng 3 phút, giữ ly nước trên đùi không để sánh giọt nào.', target: 'SLAVE' },
  { id: 'tr2', type: 'TRAIN', level: 3, content: 'Bài tập kìm nén cảm xúc (Edging): Boss kích thích Slave đến sát đỉnh rồi bất ngờ dừng lại, Slave phải hít thở sâu và cảm ơn Boss.', target: 'BOTH' },
  { id: 'tr3', type: 'TRAIN', level: 1, content: 'Bài tập xưng hô: Trong suốt 30 phút tiếp theo, nếu Slave quên gọi "Boss" hoặc không xưng "em/nô lệ" sẽ bị phạt 3 cái đánh nhẹ vào mông.', target: 'SLAVE' },
  { id: 'tr4', type: 'TRAIN', level: 2, content: 'Bài tập tin tưởng: Slave hoàn toàn thả lỏng cơ thể khi bị trói tay, để Boss dẫn dắt toàn bộ nhịp điệu cuộc yêu.', target: 'SLAVE' },
  { id: 'tr5', type: 'TRAIN', level: 3, content: 'Bài tập Sensory Deprivation: Bịt mắt + bịt tai nhẹ, chỉ cảm nhận thế giới qua xúc giác mà Boss mang lại.', target: 'SLAVE' },
  { id: 'tr6', type: 'TRAIN', level: 2, content: 'Bài tập xin phép: Mọi hành động của Slave từ uống nước, đổi tư thế, hay chạm vào người Boss đều phải cất lời xin phép rõ ràng.', target: 'SLAVE' },
  { id: 'tr7', type: 'TRAIN', level: 1, content: 'Bài tập Aftercare: Boss ôm trọn Slave vào lòng, đắp chăn ấm, xoa đầu và nói lời cảm ơn vì sự hợp tác ngoan ngoãn của Slave.', target: 'BOSS' },
  { id: 'tr8', type: 'TRAIN', level: 2, content: 'Bài tập thở đồng điệu: Slave áp ngực vào ngực Boss, điều chỉnh nhịp thở khớp hoàn toàn với nhịp thở của Boss trong 2 phút.', target: 'BOTH' },
  { id: 'tr9', type: 'TRAIN', level: 3, content: 'Bài tập Spanking & Soothing: 5 cái phạt nhẹ xen kẽ 1 cái vuốt ve âu yếm từ Boss.', target: 'BOTH' },
  { id: 'tr10', type: 'TRAIN', level: 2, content: 'Bài tập đếm nhịp tim: Slave áp tai vào ngực Boss, đếm 50 nhịp tim rồi miêu tả cảm giác của mình.', target: 'SLAVE' },
];

export const COSPLAY_OUTFITS = [
  { id: 'c1', name: 'Hầu gái ngoan ngoãn', icon: '🧹', desc: 'Váy ren đen trắng, tạp dề nhỏ, bờm tóc nơ ren phục tùng Boss' },
  { id: 'c2', name: 'Miêu nữ tinh nghịch', icon: '🐱', desc: 'Tai mèo nhung, đuôi mèo mềm mại, vòng cổ chuông reo leng keng' },
  { id: 'c3', name: 'Thỏ ngọc quyến rũ (Bunny)', icon: '🐰', desc: 'Bodysuit ôm sát, tai thỏ dài, tất lưới ren và vòng đuôi bông trắng' },
  { id: 'c4', name: 'Áo sơ mi trắng của Boss', icon: '👔', desc: 'Chỉ mặc duy nhất áo sơ mi oversized của Boss mở 3 cúc trên' },
  { id: 'c5', name: 'Y tá chăm sóc đặc biệt', icon: '💉', desc: 'Bộ đồ y tá trắng viền đỏ quyến rũ, đo nhiệt độ và chăm sóc Boss' },
  { id: 'c6', name: 'Nữ sinh ngây thơ', icon: '🎒', desc: 'Váy xếp ly kẻ caro, áo sơ mi thắt cà vạt, tất cao ngang đùi' },
  { id: 'c7', name: 'Dây ruy băng quà tặng', icon: '🎀', desc: 'Dùng duy nhất một dải ruy băng lụa đỏ thắt nơ quanh ngực làm món quà cho Boss' },
  { id: 'c8', name: 'Kimono lụa lả lướt', icon: '👘', desc: 'Áo choàng lụa mỏng quấn hờ bằng thắt lưng obi, dễ dàng cởi bỏ' },
  { id: 'c9', name: 'Thiên thần sa ngã', icon: '🪶', desc: 'Cánh lông vũ đen bí ẩn, váy ngủ voan đen xuyên thấu' },
  { id: 'c10', name: 'Thư ký nóng bỏng', icon: '👓', desc: 'Kính gọng mảnh, chân váy bút chì ôm sát và áo sơ mi lụa' },
];

export const BDSM_PROPS = [
  { id: 'p1', name: 'Bịt mắt lụa đen (Blindfold)', icon: '🙈', desc: 'Tước đi thị giác để tăng xúc cảm trên da thịt lên gấp 10 lần' },
  { id: 'p2', name: 'Vòng cổ Choker & Dây dắt', icon: '📿', desc: 'Minh chứng cho quyền lực kiểm soát và sự thuộc về của Slave' },
  { id: 'p3', name: 'Còng tay lót nhung (Cuffs)', icon: '🔗', desc: 'Giữ chặt hai tay mềm mại, vô hiệu hóa phản xạ để Boss dẫn dắt' },
  { id: 'p4', name: 'Lông vũ mơn trớn (Tickler)', icon: '🪶', desc: 'Kích thích từng sợi lông tơ dọc sống lưng và đùi non' },
  { id: 'p5', name: 'Đá viên mát lạnh (Ice cubes)', icon: '🧊', desc: 'Đánh thức các điểm nhạy cảm bằng độ lạnh tương phản' },
  { id: 'p6', name: 'Nến massage nhiệt độ thấp', icon: '🕯️', desc: 'Sáp đậu nành tan chảy ở 45°C ấm áp dịu dàng trên làn da' },
  { id: 'p7', name: 'Roi da nỉ mềm (Crop/Flogger)', icon: '🪄', desc: 'Tạo âm thanh kích thích và những cú đánh nhẹ râm ran' },
  { id: 'p8', name: 'Tinh dầu hoa hồng ấm áp', icon: '🧴', desc: 'Xoa dịu cơ bắp và làm mượt mà mọi chuyển động thân mật' },
  { id: 'p9', name: 'Ruy băng lụa trói tay (Silk ties)', icon: '🎗️', desc: 'Trói buộc mềm mại, êm ái và đầy tính nghệ thuật Shibari' },
  { id: 'p10', name: 'Kẹp ngực mạ vàng (Nipple clamps)', icon: '💎', desc: 'Tạo áp lực nhè nhẹ đánh thức khoái cảm tê tái' },
];
