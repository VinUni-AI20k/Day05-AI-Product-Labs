# AI Product Canvas: Clinical Scribe (Trợ lý AI Tạo Hồ Sơ Bệnh Án)

---

## 1. Canvas

|   | Value | Trust | Feasibility |
|---|-------|-------|-------------|
| **Câu hỏi guide** | User nào? Pain gì? AI giải quyết gì mà cách hiện tại không giải được? | Khi AI sai thì user bị ảnh hưởng thế nào? User biết AI sai bằng cách nào? User sửa bằng cách nào? | Cost bao nhiêu/request? Latency bao lâu? Risk chính là gì? |
| **Trả lời** | - **User:** Bác sĩ khám bệnh (Vinmec).<br>- **Pain:** Tốn 3-5 phút gõ hồ sơ sau mỗi ca khám, tổng cộng 1-2 tiếng mỗi ngày (gọi là "Pajama Time"). Khi khám phải cắm mặt gõ phím, giảm giao tiếp bằng mắt với bệnh nhân (KH VIP phàn nàn).<br>- **Khác biệt (AI giải quyết):** AI nghe toàn bộ cuộc thoại rồi tự đẩy dữ liệu vào đúng form JCI (Bệnh sử, Khám, Chỉ định). Bác sĩ có lại toàn bộ thời gian khám để tập trung nghe & nhìn bệnh nhân. | - **Ảnh hưởng:** AI nghe nhầm liều thuốc hoặc bịa triệu chứng (Hallucination) dẫn đến rủi ro y khoa chết người, sai chuẩn hồ sơ bảo hiểm.<br>- **Cách user biết AI sai:** Các trường dữ liệu phức tạp hoặc AI nghi ngờ (ví dụ: Tên Thuốc, Chỉ định xét nghiệm, Thông tin ngoại lệ) sẽ được bôi sáng màu VÀNG và cảnh báo bằng dấu `(??)`.<br>- **Cách sửa:** Giao diện có sẵn nút Accept/Reject cho các cụm từ bôi vàng. Bác sĩ có thể chỉnh sửa đè text bằng tay (Overwrite) trực tiếp trên form trước khi nhấn nút "Lưu HIS". | - **Cost:** Ước tính ~$0.05 / request (bao gồm API Whisper + LLM prompt). Rất rẻ so với tiền lương bác sĩ.<br>- **Latency:** Xử lý đoạn thoại 3-5 phút mất khoảng 5 - 10 giây (Whisper trans) + 10 giây (LLM extraction) -> Tổng độ trễ dưới 30 giây.<br>- **Risk:** Voice nhận diện kém ở môi trường ồn hoặc tiếng vùng miền; Rủi ro lộ dữ liệu nhạy cảm (Privacy); Bác sĩ không thèm đọc lại mà ấn "Lưu" luôn dẫn đến sai sót (Automation bias). |

---

## 2. Automation hay augmentation?

- [ ] Automation — AI làm thay, user không can thiệp
- [x] **Augmentation — AI gợi ý, user quyết định cuối cùng**

**Justify:** 
Ngành Y tế đòi hỏi trách nhiệm pháp lý 100% nằm ở người ký (Bác sĩ). AI không có chứng chỉ hành nghề, do đó AI chỉ đóng vai trò "người thư ký y khoa điện tử" soạn nháp văn bản. Việc đọc lại, chỉnh sửa và quyết định lưu dữ liệu nằm hoàn toàn ở tay bác sĩ. Nếu thiết kế Automation thì sẽ vi phạm tiêu chuẩn quản lý rủi ro y khoa.

---

## 3. Learning signal (Tín hiệu phản hồi để AI học)

| # | Câu hỏi | Trả lời |
|---|---------|---------|
| 1 | User correction đi vào đâu? | Đi vào một bảng Database riêng (Log Table): So sánh bản nháp AI (Before) và bản bác sĩ đã sửa/lưu (After) (Data pair: Âm thanh - Text sau sửa). |
| 2 | Product thu signal gì để biết tốt lên hay tệ đi? | 1. **Edit Distance / Tỉ lệ Reject:** Số từ bác sĩ phải xóa/gõ lại trên mỗi ca.<br>2. **Thời gian review:** Ban đầu mất 40s đọc, sau giảm còn 10s chứng tỏ AI viết chuẩn văn phong hơn.<br>3. **Feedback Rating:** Nút Thumbs Up/Down ở cuối ngày. |
| 3 | Data thuộc loại nào? | - [x] Domain-specific (Văn phong bệnh viện Vinmec, chuẩn JCI)<br>- [x] Human-judgment (Bác sĩ chuyên khoa check và quyết định)<br>- Yếu tố khác: Data hội thoại thật cực kỳ quý hiếm. |

**Có marginal value không? (Model đã biết cái này chưa? Ai khác cũng thu được data này không?)**
> **Có (Very High Marginal Value).** Chatbot/LLM thông thường như GPT-4 không thể tự biết phong cách viết SOAP, cách dùng từ địa phương, mã ICD-10 quy ước riêng, cũng như danh mục thuốc nội bộ. Việc tích lũy kho dữ liệu Audio-to-SOAP được chuyên gia xác thực (Human-expert verification) tạo ra con hào bảo vệ (Moat) độc quyền cho Vinmec, các hãng bên ngoài rất khó sao chép được do bị vướng rào cản bảo mật y tế HIPAA/Luật Khám chữa bệnh.
