# Mini AI Spec: Clinical Scribe (Trợ lý Tạo Hồ Sơ Bệnh Án)

📝 **Vấn đề & Mục tiêu (Problem & Value)**
Bác sĩ Vinmec hiện đang mất từ 1 đến 2 tiếng mỗi ngày chỉ để cắm mặt vào máy tính tự gõ hồ sơ bệnh án sau mỗi ca khám (gọi là "Pajama Time"). Việc này vừa gây áp lực dễ dẫn tới "Burnout" cho nhân viên y tế, vừa làm trải nghiệm của bệnh nhân VIP bị giảm sút vì bác sĩ không có thời gian giao tiếp bằng mắt.
**Clinical Scribe** ra đời như một "Trợ lý Thư ký điện tử". Cốt lõi của sản phẩm là khả năng "lắng nghe" cuộc hội thoại thông thường giữa bác sĩ và bệnh nhân, sau đó tự động bóc tách (Extract) từ khóa và dịch chúng ra ngôn ngữ chuẩn y khoa (chuẩn JCI, mã ICD-10) để điền sẵn vào các Box của hệ thống Bệnh viện (HIS). Hệ thống giúp giảm thời gian soạn hồ sơ từ 3 phút/ca xuống còn 30 giây duyệt/ca.

🤖 **Tính chất tương tác AI (Augmentation vs Automation)**
Đây hoàn toàn là hệ thống **Augmentation (Trợ lực)**. Do rào cản pháp lý và tính mạng y khoa, mọi quyết định lưu bệnh án đều thuộc trách nhiệm của Bác sĩ. AI chỉ đóng vai trò "Viết nháp" (Drafting).

🎯 **Đo lường & Chỉ tiêu tối ưu (Evaluation Metrics & Threshold)**
Hệ thống ưu tiên optimize **Recall** (Độ bao phủ) lên trên 95%. Bác sĩ cần một cuốn hồ sơ nháp đầy đủ triệu chứng để rà soát thay vì một văn bản gọn lỏn nhưng bị thiếu sót thông tin quan trọng. Quá trình xoá đoạn thừa chỉ tốn 2 giây, nhưng việc ngồi ngẫm nghĩ gõ lại phần thiếu sẽ phá vỡ mục tiêu tiết kiệm thời gian ban đầu. Về STT, Word Error Rate (WER) bắt buộc phải luôn < 5%. 

⚠️ **Rủi ro cốt tử (Top Failure Mode & Mitigation)**
Tử huyệt của GenAI trong y tế là bịa đặt thông tin (Hallucination) - ví dụ bịa thêm liều lượng thuốc hoặc tự gắn cho bệnh nhân một căn bệnh mà họ không có, dẫn đến shock thuốc hoặc lách luật bảo hiểm. Để trị rủi ro này, UI/UX buộc phải ra tay: Bất kỳ phần thông số thuốc hoặc thông tin LLM có Confidence Score thấp đều bị hệ thống ép **BÔI NỀN VÀNG `(??)`** chói lọi. Bác sĩ lúc đọc lướt sẽ bị chặn lại ở các cụm màu vàng, bắt buộc phải dùng nút *"Accept"* hoặc *"Reject"* bằng tay. 

🔄 **Vòng lặp Dữ liệu (Data Flywheel)**
Hệ thống sinh ra **High Marginal Value** thông qua hành vi "Correction" của user. Mỗi khi bác sĩ sửa một cụm từ hoặc ấn Reject trên màn hình, hệ thống sẽ thu về một cặp dữ liệu (Data Pair): `[Đoạn nháp AI viết] -> [Đoạn text Bác sĩ sửa lại chuẩn y khoa]`. Bảng log này là kho báu độc quyền, giúp bệnh viện sở hữu tệp Dữ liệu Đào tạo Đội chuyên gia (Domain-specific & Human-judgment Data). Hàng tuần, dữ liệu này dùng để Fine-tune model, giúp AI viết ngày càng "trâu" và mang đậm văn phong riêng của vị trưởng khoa bệnh viện.
