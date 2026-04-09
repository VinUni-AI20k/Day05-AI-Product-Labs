# Eval Metrics + Threshold: Clinical Scribe

Bộ chỉ số đánh giá (Evaluation) và các ngưỡng (Threshold) dành riêng cho hệ thống AI tạo hồ sơ bệnh án, xác định độ an toàn y khoa trước khi đưa vào bệnh viện.

---

## 1. Định hướng tối ưu: Precision hay Recall?

- [ ] Precision (Độ chuẩn xác)
- [x] **Recall (Độ bao phủ)** — AI thu thập và ghi nhận đầy đủ tất cả thông tin, triệu chứng y khoa xuất hiện trong cuộc hội thoại.

**Tại sao ưu tiên Recall?**
Trong bài toán Clinical Scribe cho bác sĩ, việc ưu tiên Recall mang lại ý nghĩa sống còn cho tính năng Augmentation (trợ lý):
1. **Tránh bỏ sót thông tin y khoa quan trọng:** Trong chẩn đoán, việc bỏ lỡ một triệu chứng nhỏ hoặc lời phàn nàn của bệnh nhân (Low Recall) có nguy cơ gây sai lệch chẩn đoán cực cao. Một hồ sơ đầy đủ giúp bác sĩ có cái nhìn toàn diện nhất.
2. **Thao tác xóa nhanh hơn thao tác gõ mới:** AI soạn nháp để bác sĩ duyệt. Nếu AI ghi thừa, bác sĩ chỉ mất 1-2 giây để bôi đen và xóa. Ngược lại, nếu AI bỏ sót, bác sĩ phải lục lại trí nhớ và tốn 30-60 giây để gõ lại từ đầu, làm hao hụt thời gian tiết kiệm được.
3. **Bác sĩ là bộ lọc Precision hoàn hảo nhất:** Con người (nhất là chuyên gia y tế) lọc nhiễu và xác thực (Precision) rất tốt nhưng lại có giới hạn về khả năng ghi nhớ chi tiết một đoạn hội thoại dài. AI đóng vai trò ghi chép đầy đủ (Recall), để bác sĩ làm bộ lọc. Các thông tin AI trích xuất nhưng độ chắc chắn thấp (Precision thấp) sẽ được **tự động bôi vàng `(??)`** để bác sĩ tập trung review và sửa lại nhanh chóng.
4. **Giảm áp lực ghi nhớ:** Ưu tiên Recall giúp bác sĩ trút bỏ gánh nặng ghi nhớ, hoàn toàn yên tâm 100% hướng mắt về phía bệnh nhân (eye-contact).

---

## 2. Bảng Metrics & Thresholds Chính

| Metric (Chỉ số đo lường) | Threshold (Ngưỡng đạt chuẩn) | Red flag (Báo động đỏ - Dừng hệ thống) |
|--------|-----------|---------------------|
| **Recall (Tỉ lệ bao phủ thông tin)** - Số triệu chứng, chỉ định AI bắt được so với số lượng thực tế nói trong ca khám | ≥ 95% | **< 85%** (AI bỏ sót quá nhiều thông tin, bác sĩ phải tự gõ lại mất thời gian). |
| **WER (Word Error Rate)** của module Whisper trên từ vựng Y khoa | < 5% (Sai số dưới 5 từ trên 100 từ) | **> 15%** liên tục 3 ngày (Hệ thống Whisper bị điếc do môi trường nhiễu hoặc sai biệt dược trầm trọng). |
| **Accuracy (Pydantic Schema Match)** - Tỉ lệ AI điền đúng format quy định của bệnh viện | ≥ 98% | **< 90%** (LLM không tuân thủ JSON/Pydantic, trả về text lộn xộn khiến HIS không đọc được). |
| **Edit Distance (Correction Rate)** - Số lượng ký tự/từ bác sĩ phải gõ đè để sửa đổi sau khi AI tạo nháp | < 10% (Bác sĩ chỉ phải sửa rất ít) | **> 30%** (Bác sĩ thà tự gõ từ đầu còn nhanh hơn ngồi đi fix lỗi cho AI). |
| **Critical Hallucination Rate** - Tỉ lệ AI tự bịa ra Thuốc/Liều lượng hoặc Tiền sử bệnh mà trong File Ghi âm KHÔNG HỀ CÓ | **0% (Zero Tolerance)** | **> 0% (Dù chỉ 1 ca sai)** → Buộc phải tạm dừng để rào lại Prompt và cảnh báo Human-in-the-loop. |
| **Time-saved per Session** - Giải quyết mục tiêu "Pajama Time" | Tiết kiệm ≥ 70% thời gian gõ so với trước đây (từ 3p xuống <1p). | **< 30%** (Sài AI mà vẫn chậm như tự gõ máy). |

---

## 3. Mở rộng: User-facing metrics vs Internal metrics

Không phải mọi thứ đo lường đều hiển thị lên giao diện của bác sĩ. 

| Metric | User (Bác sĩ) có thấy không? | Mục đích sử dụng |
|--------|-----------|-----------------|
| **Confidence Score (Độ tự tin của LLM)** | ☑️ Có (Dưới dạng mã màu) | Mức độ < 80% sẽ hiển thị highlight Vàng và biển báo `(??)` để ép bác sĩ phải đọc kỹ. |
| **Response Latency (Thời gian load AI)** | ❌ Không hiện con số ms | Tránh làm phiền, chỉ hiển thị "Skeleton loading" khi request tốn trên 3s. |
| **Edit Distance (Độ dài đoạn text bác sĩ tự sửa)** | ❌ Không hiện | Logs đưa thẳng về DB của team Product để tính toán độ hiệu quả và Fine-tune lại mô hình. |

---

## 4. Offline Eval vs Online Eval

Hệ thống được giám sát liên tục theo 2 phase:

| Loại | Thời điểm | Cách thức đo & Metric | Ví dụ thực tế |
|------|---------|-------|-------|
| **Offline Eval** | Trước khi Deploy (Staging) | Đo Precision/Recall trên tập dataset 500 file ghi âm bác sĩ thật. Chấm điểm ROUGE score so với hồ sơ chuẩn của trưởng khoa. | Cứ mỗi lần update version LLM hoặc Prompt mới, tự động chạy qua tập test 500 ca này xem có bị Hallucinate thuốc không. |
| **Online Eval** | Sau khi Deploy (Production) | Đo Telemetry từ hành vi thật của bác sĩ (Accept/Reject, Edit Distance, Time to Save). | Sau 1 tuần, query bảng `correction_logs` xem bác sĩ phải sửa phần "Khám Lâm Sàng" nhiều nhất hay phần "Bệnh Sử". Nếu bác sĩ bấm "Thumbs Down" liên tục -> Kiểm tra lại prompt. |

