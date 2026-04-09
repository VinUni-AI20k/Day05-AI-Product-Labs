# User Stories — 4 Paths: Clinical Scribe

Dưới đây là kịch bản trải nghiệm người dùng (UX) cho tính năng cốt lõi của hệ thống Clinical Scribe, được thiết kế bao phủ cả 4 tình huống xảy ra khi tương tác với AI Y tế.

---

## Tính năng: AI Trích xuất & Điền tự động hồ sơ bệnh án (Voice-to-SOAP)

**Trigger:** Bác sĩ bật mic ghi âm hội thoại cuộc khám → Kết thúc, nhấn nút "Tạo hồ sơ" → AI (Whisper + LLM) xử lý pipeline → Render thông tin đã điền lên các trường (Bệnh sử, Khám lâm sàng, Chỉ định xét nghiệm/Thuốc).

| Path | Câu hỏi thiết kế | Mô tả chi tiết |
|------|-------------------|-------|
| 🟢 **Happy**<br>*(AI đúng, tự tin)* | User thấy gì? Flow kết thúc ra sao? | Màn hình hiển thị đầy đủ thông tin bệnh án, câu văn trôi chảy, đúng chuẩn form ICD-10. Không có từ ngữ nào bị đánh dấu lấp lửng. Bác sĩ chỉ mất 20-30s đọc lướt, thấy hoàn hảo, nhấn "Lưu HIS" và xong ca khám. |
| 🟡 **Low-confidence**<br>*(AI không chắc chắn)* | System báo "không chắc" bằng cách nào? User quyết thế nào? | Bệnh nhân dùng từ địa phương khó hiểu hoặc đọc một tên thuốc hiếm/phát âm sai, microphone rè. Hệ thống map text nhưng **bôi nền màu VÀNG** kèm ký hiệu `(??)`. Bác sĩ lúc lướt duyệt sẽ bị thu hút sự chú ý vào điểm vàng này → tự định hình lại và sửa đổi, hoặc ấn "Accept" nếu AI đoán trúng. |
| 🔴 **Failure**<br>*(AI sai/Hallucinate)* | User biết AI sai bằng cách nào? Recover ra sao? | AI bị "ảo giác" (Hallucinate) tự chế ra liều thuốc 500mg thành 5000mg, hoặc bệnh nhân "không ho" thành "có ho kéo dài". Bác sĩ duyệt lại văn bản trích xuất trực tiếp trên màn hình, phát hiện sự vô lý so với biểu hiện thực tế. Bác sĩ recover bằng cách bôi đen xoá cụm từ sai đó đi, và tự type đè lại liều lượng đúng. |
| 🔵 **Correction**<br>*(User can thiệp sửa)* | User sửa bằng cách nào? Data đó đi vào đâu? | Bác sĩ dùng chuột nhấn Reject các highlight vàng, hoặc tự gõ text mới (Overwrite) trực tiếp trên các trường Input Field của giao diện. Toàn bộ hành vi "xóa/sửa text" này được API bắt lại `(Text Draft AI) vs (Text Final Bác sĩ)` và lưu thẳng vào table `correction_logs` làm data pair, tự động dùng cho pipeline Fine-tuning định kỳ cuối tuần. |

---

## Mở rộng - Edge Cases (Các tình huống biên)

Dưới đây là 3 tình huống biên ngoài luồng mà AI Clinical Scribe có thể gặp trở ngại tại phòng khám Vinmec:

| Edge case | Dự đoán AI sẽ xử lý thế nào | UX nên phản ứng ra sao |
|-----------|------------------------------|------------------------|
| **1. Bệnh nhân nói tiếng lóng vùng miền / khó nghe** *(VD: "đau con trối", "tức cái lồng ngực")* | Whisper nhận diện thành text thô nhưng LLM không map được vào chuẩn Y khoa ICD-10. | Hệ thống bôi vàng nguyên text tiếng lóng, LLM để trống phần mã bệnh. UX hiện tooltip: *"Ngôn ngữ chưa rõ nghĩa, vui lòng bác sĩ chuẩn hóa thủ công."* |
| **2. Tạp âm có đối thoại dư thừa** *(VD: Người nhà bệnh nhân mắng mỏ nhau chen vào lúc bác sĩ khám)* | LLM có thể bị nhiễu context (distraction) và đưa luôn chuyện gia đình vào "Bệnh sử". | Yêu cầu LLM Prompt quy định nghiêm ngặt chỉ trích xuất "triệu chứng y khoa định lượng". Nếu AI vẫn lỡ trích xuất rác, UI cho phép bác sĩ highlight một cụm lớn và bấm xoá nhanh bằng 1 click. |
| **3. Cuộc khám quá ngắn** *(VD: Bệnh nhân chỉ vào xin lại đơn thuốc cũ, không khám)*| Âm thanh dưới 30s. Mở LLM bóc dữ liệu sẽ bị thiếu hầu hết các trường Required như "Khám lâm sàng". | UX hiển thị cảnh báo nhẹ: *"Cuộc hội thoại quá ngắn, AI chưa thu thập đủ thông tin form chuẩn JCI. Vui lòng tự bổ sung phần Khám Lâm Sàng để được phép Lưu."* |

---
