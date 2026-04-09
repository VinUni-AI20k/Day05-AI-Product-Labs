# Top 3 Failure Modes: Clinical Scribe

Dưới đây là 3 kịch bản lỗi (Failure Modes) nguy hiểm nhất có thể xảy ra khi triển khai AI Clinical Scribe tại bệnh viện, tập trung vào những lỗi **bác sĩ có thể không nhận ra ngay lập tức**.

> **Nguyên tắc thiết kế:** "Lỗi nguy hiểm nhất không phải là hệ thống sập, mà là hệ thống chạy mượt nhưng chèn sai thông tin y tế mà người dùng (Bác sĩ) nhắm mắt bấm Lưu."

---

## 1. Bảng Failure Modes Chính

| # | Trigger (Nguyên nhân kích hoạt) | Hậu quả (Tác động thực tế) | Mitigation (Biện pháp phòng/chống) |
|---|---------|---------|------------|
| 1 | **Hallucination Y khoa âm thầm:** Bệnh nhân nói "không bị dị ứng thuốc", hoặc phòng khám quá ồn khiến Whisper nghe nhầm. LLM tự động "bịa" ra bệnh nhân có tiền sử dị ứng, hoặc tự ý thay đổi liều lượng (vd: 10mg thành 100mg). | **Cực kỳ nguy hiểm (Sai lệch chẩn đoán & Chỉ định).** Bác sĩ lướt qua quá nhanh (Automation Bias) không đọc kỹ, lưu vào HIS. Bệnh nhân sau đó bị sốc thuốc hoặc bị từ chối bảo hiểm do sai tiền sử bệnh. | 1. Ép output LLM vào **Pydantic Schema** nghiêm ngặt.<br>2. **UI/UX rào cản:** Bất kỳ thông số định lượng nào (Liều lượng, Tên thuốc biệt dược, Mã ICD) đều bị **bôi VÀNG `(??)`** để bẻ gãy quán tính đọc lướt, ép bác sĩ phải dừng mắt lại nhấn review.<br>3. Giữ nguyên chức năng Augmentation (Bác sĩ CHỊU TRÁCH NHIỆM ký duyệt), tuyệt đối không làm Auto-save. |
| 2 | **Low Recall (Bỏ sót triệu chứng mấu chốt):** Bệnh nhân nói tiếng địa phương lóng, nói quá nhanh, hoặc giọng lí nhí. AI tóm tắt (Summarize) quá tay, lọc mất các "nhánh thông tin phụ" nhưng thực chất lại là triệu chứng chỉ điểm của một bệnh hiếm. | **Nguy hiểm bậc trung (Chẩn đoán thiếu).** Hồ sơ bệnh án bị nghèo nàn. Nếu bác sĩ không nhớ để gõ bổ sung, các bác sĩ tuyến sau đọc lại hồ sơ sẽ bị thiếu dữ liệu chẩn đoán phân biệt. | 1. Trong Prompt LLM, đặt System Instruction: *"Không được tóm tắt làm mất các Keyword y khoa, ưu tiên trích xuất nguyên văn (Verbatim) các danh từ chỉ triệu chứng."*<br>2. Giao diện luôn có Box Text cho phép bác sĩ **gõ bổ sung nhanh** vào form đang điền dở. |
| 3 | **Hệ thống sập/Quá tải API (Downtime):** Mạng bệnh viện chập chờn, API Whisper/LLM cloud bị timeout do quá tải vào giờ cao điểm sáng thứ 2. | **Gián đoạn quy trình (Bác sĩ bức xúc).** Bác sĩ đã quen không gõ máy tính, đột nhiên AI quay mòng mòng 1 phút không ra chữ. Khám xong bệnh nhân mà hồ sơ vẫn trắng trơn, gây ùn tắc phòng khám. | 1. Đặt **Timeout = 15 giây**. Nếu quá 15s API không trả kết quả, UX phải báo lỗi NGAY LẬP TỨC: *"Kết nối AI gián đoạn, vui lòng chuyển qua gõ tay"*, tránh để bác sĩ chờ đợi mù quáng.<br>2. Có nút "Dừng AI" để bác sĩ giành lại quyền chủ động gõ phím ngay lập tức. |

---

## 2. Mở rộng: Ma trận Severity × Likelihood

Xếp hạng độ ưu tiên xử lý cho 3 lỗi trên để team Dev căn bổ nguồn lực:

```text
            Likelihood (Khả năng xảy ra)
            Thấp                     Cao
          ┌────────────────────┬────────────────────┐
          │                    │                    │
Severity  │  Monitor + Plan    │  FIX BẰNG MỌI GIÁ  │
(Hậu quả) │  (Mode 3: API sập) │  (Mode 1: Bịa thuốc│
Cao       │                    │   + Hallucination) │
          │                    │                    │
          ├────────────────────┼────────────────────┤
          │                    │                    │
Severity  │  Accept (By Design)│  Xử lý UI/UX       │
Thấp      │                    │  (Mode 2: Bỏ sót   │
          │                    │   tin do giọng lạ) │
          └────────────────────┴────────────────────┘
```

**Nhận định Mức độ Ưu tiên:**
- **Mode 1 (Hallucination)** nằm ở ô ĐỎ MÁU (High Severity x High Likelihood với LLM hiện nay). Bắt buộc phải dồn 80% công sức Dev UI để làm tính năng "Bôi Vàng & Accept/Reject" cảnh báo bác sĩ.
- **Mode 2 (Bỏ sót do giọng lạ)** xảy ra thường xuyên nhưng hệ quả thấp hơn vì bác sĩ dễ dàng gõ bù thêm. 

---

## 3. Adversarial / Misuse Scenarios (Lạm dụng hệ thống)

Ngoài lỗi do AI, hệ thống cũng cần cẩn thận hành vi lạm dụng từ chính người dùng:

| Scenario (Hoàn cảnh lạm dụng) | Hậu quả | Phòng tránh (Mitigation) |
|----------|---------|-------------|
| **Bác sĩ làm biếng (Over-reliance):** Bác sĩ ỷ lại hoàn toàn vào AI, không thèm khám kỹ mà cứ bật mic nói vơ vào vài câu để AI tự phịa ra 1 hồ sơ mĩ miều đối phó với JCI. | Hồ sơ bệnh án thành văn mẫu sáo rỗng, chất lượng khám thực tế đi xuống nhưng giấy tờ vẫn đẹp. | Đo đạc **Audio Length**. Nếu file ghi âm < 15 giây mà AI lại gen ra 1 đoạn dài ngoằng, đánh flag "Bất thường" lên hệ thống quản lý của Trưởng khoa. |
| **Thêm thắt để lách Luật Bảo Hiểm:** Bác sĩ cố tình đọc to các triệu chứng KHÔNG CÓ thật vào mic (vd: "đau dạ dày dữ dội") để hợp thức hóa việc kê đơn thực phẩm chức năng moi tiền BHYT. | AI vẫn ghi nhận trung thực (vì nó nghe thấy). Bệnh viện thất thoát quỹ bảo hiểm do bị xuất toán. | Lưu trữ **File Audio gốc** kèm theo Log text. Khi BHYT thanh tra, có thể lấy băng ghi âm ra đối chiếu rành rọt tiếng bác sĩ tự đọc hay thực sự là lời bệnh nhân mô tả. |

