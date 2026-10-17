# STM32 Signal Lab · EN813202

เว็บภาษาไทยสำหรับเรียน STM32 ตั้งแต่พื้นฐานถึงพร้อมสอบ พร้อม technical terms ภาษาอังกฤษ

**เปิดเรียน:** https://vveb1250.github.io/stm32-exam-lab/

## ภายในคอร์ส

- 18 บท ทุกบทเลือกอ่านพื้นฐาน, พร้อมสอบ หรือเจาะลึก และไปบทต่อไปได้
- 9 ห้องทดลอง: GPIO active-low, bit mask, debounce, UART 8N1 LSB-first, ADC, sampling jitter, Timer/PWM, system bandwidth และ code tracing
- ข้อฝึกหลัก 70 ข้อ (GPIO15/UART20/ADC20/Interrupt15) และข้อเสริม 12 ข้อ ตามชุดจำลองในบทสนทนาเดิม พร้อมเฉลยและ rubric ประเมินเหตุผลด้วยตนเอง
- โหมดฝึกต้องเลือกคำตอบและเขียนเหตุผลก่อนเฉลย โหมดสอบปิดเฉลยจนส่งครบ 70 ข้อ
- ค้นหาเนื้อหาและข้อฝึก, บันทึกความก้าวหน้า/คำตอบด้วย localStorage, keyboard controls และ responsive layout

## ขอบเขตความถูกต้อง

Blueprint 70 ข้อ 140 คะแนนและ pin mapping ยืนยันจากรูปประกาศที่ผู้ใช้ให้ แต่โจทย์ฝึกเป็นเนื้อหาที่ ChatGPT สร้างในบทสนทนาเดิม ไม่ใช่ข้อสอบจริง ตัวเลือกและ rubric เป็นส่วนที่เพิ่มเพื่อใช้งานบนเว็บ แหล่งอ้างอิงและสถานะของข้อมูลดูได้ที่ `#sources` หรือ [`src/sources.js`](src/sources.js)

รุ่น MCU และ HAL ที่ใช้ในห้องเรียนยังไม่ทราบ ตัวอย่างอ้างอิง **STM32F4 HAL1 driver v1.8.3** และต้องมี initialization/configuration ที่ตรงกับบอร์ดก่อนใช้ ไม่ใช่ firmware project ที่ compile/run บนบอร์ดแล้ว Simulator เป็นแบบจำลองเพื่ออธิบายหลักการ

คะแนนตัวเลือกถูก `/70` แยกจากคะแนนฝึกที่ผู้เรียนตรวจเหตุผลเอง `/140` ไม่มีการตรวจข้อความอัตโนมัติ เกณฑ์จริงต้องตอบถูกพร้อมเหตุผลถูกต้องจึงได้ 2 คะแนน ไม่ใช่แบ่งครึ่งคะแนนให้เลือกกับเหตุผล

เอกสาร Z80 เดิมไม่ใช้เป็นฐานรายละเอียด STM32 และไม่มีรูปข้อสอบหรือรูปบุคคลต้นฉบับใน repository นี้

## พัฒนาและทดสอบ

ใช้ Node.js 22 ขึ้นไป ไม่มี dependency สำหรับ runtime ของเว็บ

```sh
npm ci
npm test
npm run lint
npm run build
npm start
```

เปิด `http://127.0.0.1:4173/stm32-exam-lab/` การเสิร์ฟใต้ชื่อ repository ใช้ตรวจ path ของ GitHub project Pages โดยตรง Assets ใช้ relative URLs และ routes ใช้ hash จึง refresh ลิงก์ย่อยได้

```sh
# Windows ที่มี Edge
npm run test:e2e

# Linux / CI
npx playwright install --with-deps chromium
CI=true npm run test:e2e
```

Tests ครอบคลุม calculation/trace, content schema, build/server integration, การฝึกครบ 82 ข้อ, ทำข้อสอบครบ 70 ข้อ, persistence/reset, keyboard, search, labs และ 18×3 lesson states ที่ความกว้าง 320/390/768/1280/1440 พร้อม axe checks เก็บผลที่ [`evidence/test-results.json`](evidence/test-results.json)

GitHub Actions ทดสอบก่อน deploy ทุก push บน `main` และเก็บ browser evidence เป็น artifact ต้องตั้ง Pages source เป็น GitHub Actions

## Design และแหล่งที่มา

ใช้ไฟล์ skills จริงของ WhipUI, Combo Deliver และ grill-me/grilling โดยทำคำถามเฉพาะที่จำเป็นตามที่ผู้ใช้ขอ ข้อตกลงผลิตภัณฑ์และ source boundary อยู่ใน [`PRODUCT.md`](PRODUCT.md) ระบบภาพที่ใช้จริงอยู่ใน [`DESIGN.md`](DESIGN.md)

Screenshots และ comparison เป็นหลักฐานของการตรวจ render ไม่ใช่หลักฐานว่าผู้เรียนทุกคนจะเรียนสำเร็จ ยังไม่มี participant study หรือการทดสอบกับบอร์ดจริง Font Noto Sans Thai มาจาก Google Fonts ภายใต้ [SIL OFL](public/OFL-NotoSansThai.txt)
