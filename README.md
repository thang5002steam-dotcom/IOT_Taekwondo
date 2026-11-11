# IOT Taekwondo

Kho mã nguồn này gồm ứng dụng quản lý võ đường, các dịch vụ phía máy chủ và luồng cảm biến ESP32. Mỗi thư mục cấp một là một dự án riêng; chạy lệnh cài đặt trong đúng thư mục của dự án đó.

## Bắt đầu đọc ở đâu?

| Thư mục | Vai trò | Điểm bắt đầu |
| --- | --- | --- |
| [`ai-receptionist-web-be-java`](ai-receptionist-web-be-java/) | API nghiệp vụ Spring Boot: tài khoản, học viên, lớp học, điểm danh, tài chính và thông báo | [`docs/DOMAIN_OVERVIEW.md`](ai-receptionist-web-be-java/docs/DOMAIN_OVERVIEW.md), [`application.yml`](ai-receptionist-web-be-java/src/main/resources/application.yml), [`controller`](ai-receptionist-web-be-java/src/main/java/com/dat/ai_receptionist_web/controller/) |
| [`taekwondo-mobile-react-native`](taekwondo-mobile-react-native/) | Ứng dụng Expo/React Native cho người dùng, gọi API Java và nhận sự kiện MQTT | [`src/app`](taekwondo-mobile-react-native/src/app/), [`src/features`](taekwondo-mobile-react-native/src/features/), [`src/config/env.ts`](taekwondo-mobile-react-native/src/config/env.ts) |
| [`ai-receptionist-be-py`](ai-receptionist-be-py/) | FastAPI tạo vector đặc trưng khuôn mặt từ ảnh; có thêm tiến trình ADK Web phục vụ nhập liệu/GraphRAG | [`README.md`](ai-receptionist-be-py/README.md), [`app/main.py`](ai-receptionist-be-py/app/main.py) |
| [`iot_mqtt`](iot_mqtt/) | MQTT broker và relay: nhận dữ liệu ESP32, chuẩn hóa rồi chuyển tới ứng dụng | [`README.md`](iot_mqtt/README.md), [`main.py`](iot_mqtt/main.py), [`.env.example`](iot_mqtt/.env.example) |
| [`esp32`](esp32/) | Firmware ESP32 đọc cảm biến PIR và gửi dữ liệu qua MQTT | [`platformio.ini`](esp32/platformio.ini), [`src/main.cpp`](esp32/src/main.cpp), [`include/config.example.h`](esp32/include/config.example.h) |

Nếu muốn hiểu nghiệp vụ trước, đọc `DOMAIN_OVERVIEW.md`, sau đó theo một chức năng cụ thể từ `controller` → `service` → `repository` ở Java, rồi tìm tên chức năng tương ứng trong `src/features` của ứng dụng. Các migration trong [`db/migration`](ai-receptionist-web-be-java/src/main/resources/db/migration/) thể hiện cấu trúc cơ sở dữ liệu hiện tại.

## Các phần kết nối với nhau

```text
Ứng dụng Expo ──HTTP──> API Java ──> PostgreSQL / Redis / RabbitMQ
                          │
                          └── ảnh khuôn mặt ──> FastAPI Python

Cảm biến PIR ──> ESP32 ──MQTT TCP :1883──> iot_mqtt broker + relay
                                            │
                                            └──MQTT WebSocket :9001/mqtt──> Ứng dụng Expo
```

- Ứng dụng gọi API Java qua `EXPO_PUBLIC_API_URL_JAVA`. API Java gọi dịch vụ Python để tạo face embedding khi tính năng khuôn mặt được cấu hình.
- ESP32 gửi lên topic `esp32/{deviceId}/sensor`. Relay chuyển sự kiện đã chuẩn hóa sang `taekwondo/events`; ứng dụng nhận qua WebSocket.
- ADK Web/GraphRAG trong dự án Python là tiến trình riêng, không phải một endpoint của FastAPI chính. Xem [hướng dẫn Python](ai-receptionist-be-py/README.md) nếu cần chạy phần này.

### Luồng MQTT đến fog server

Trong dự án này, **fog server** là máy trong mạng nội bộ chạy tiến trình Python [`iot_mqtt/main.py`](iot_mqtt/main.py). Một tiến trình chứa cả aMQTT broker và relay; dữ liệu cảm biến được xử lý ở máy này trước khi chuyển cho ứng dụng.

1. ESP32 kết nối Wi-Fi rồi kết nối đến IPv4 của fog server qua MQTT TCP, cổng `1883`. Địa chỉ broker, `DEVICE_ID` và topic được đặt trong `esp32/include/config.h` (tạo từ [`config.example.h`](esp32/include/config.example.h)). Khi mất Wi-Fi hoặc MQTT, firmware thử kết nối lại.
2. Khi cảm biến PIR chuyển từ không phát hiện sang phát hiện chuyển động, [`src/main.cpp`](esp32/src/main.cpp) gọi `publishSensorSample()`. Lệnh `SCAN` trong Serial Monitor cũng gọi hàm này để thử thủ công. Bản tin hiện tại là dữ liệu demo `{"value":N}` với `N` ngẫu nhiên từ 1 đến 10, **không phải số đo nhiệt độ/độ ẩm**.
3. ESP32 publish bản tin tới `esp32/<deviceId>/sensor`, ví dụ `esp32/esp32-01/sensor`, với QoS 1 và `retain=false`. ESP32 chờ `PUBACK` từ broker; ACK này xác nhận broker đã nhận bản tin, chưa xác nhận ứng dụng đã nhận.
4. Broker trên fog server nhận bản tin. Relay [`app/mqtt_relay.py`](iot_mqtt/app/mqtt_relay.py) subscribe `esp32/+/sensor`, lấy `deviceId` từ topic và dùng [`app/event_mapper.py`](iot_mqtt/app/event_mapper.py) tạo sự kiện `SENSOR_UPDATE` gồm `eventId`, `occurredAt` và `data`.
5. Relay publish sự kiện đã chuẩn hóa lên `taekwondo/events` cũng với QoS 1. Ứng dụng Expo kết nối broker bằng MQTT qua WebSocket `ws://<IP_FOG_SERVER>:9001/mqtt` và subscribe topic này. Ở màn hình cảm biến, người dùng cần đăng nhập và bật **Bật nhận**; khi nhận một sự kiện, ứng dụng hiển thị payload rồi chuyển sang luồng check-in.

Ví dụ một bản tin được chuyển đổi (ID và thời gian thay đổi theo từng lần gửi):

```text
ESP32 → topic esp32/esp32-01/sensor: {"value":7}
Fog server → topic taekwondo/events:
{"type":"SENSOR_UPDATE","eventId":"<uuid>","occurredAt":"<UTC_ISO_TIME>","data":{"value":7,"deviceId":"esp32-01"}}
```

Đường MQTT này không đi qua API Java. Theo mã hiện tại, fog server phát lại sự kiện cho client đang kết nối; nó không lưu bản tin cảm biến vào cơ sở dữ liệu. Các cổng và topic mặc định nằm trong [`iot_mqtt/.env.example`](iot_mqtt/.env.example).

## Chạy thử từng phần

Các lệnh dưới đây chạy từ thư mục gốc của kho mã nguồn. Những dịch vụ ngoài như PostgreSQL, Redis, RabbitMQ và thông tin truy cập phải được chuẩn bị theo [`application.yml`](ai-receptionist-web-be-java/src/main/resources/application.yml) trước khi chạy đầy đủ API Java. Không đưa mật khẩu hoặc khóa dịch vụ vào commit.

### 1. API Java

Cần JDK 21. Cấu hình kết nối PostgreSQL bằng `SPRING_DATASOURCE_URL`, `SPRING_DATASOURCE_USERNAME`, `SPRING_DATASOURCE_PASSWORD`; kiểm tra thêm các biến Redis, RabbitMQ, JWT và dịch vụ tích hợp trong `application.yml` tùy chức năng sử dụng. Flyway quản lý migration khi khởi động nếu được bật.

```powershell
cd ai-receptionist-web-be-java
.\mvnw.cmd spring-boot:run
```

Mặc định ứng dụng di động trỏ tới `http://localhost:8080/api/v1`. Các API nằm trong [`controller`](ai-receptionist-web-be-java/src/main/java/com/dat/ai_receptionist_web/controller/); quy tắc nghiệp vụ bổ sung nằm trong [`docs`](ai-receptionist-web-be-java/docs/).

### 2. Dịch vụ Python tạo face embedding

```powershell
cd ai-receptionist-be-py
python -m venv .venv
.\.venv\Scripts\Activate.ps1
python -m pip install -r requirements.txt
uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Kiểm tra `GET http://localhost:8000/health`; API nhận ảnh là `POST /face-embeddings`. Để Java gọi được dịch vụ này, cấu hình `BACKEND_PYTHON_API` và `HUGGING_FACE_TOKEN` cho Java theo [`PythonBackendClient.java`](ai-receptionist-web-be-java/src/main/java/com/dat/ai_receptionist_web/client/PythonBackendClient.java). Chi tiết request/response và cách chạy ADK Web có trong [README của Python](ai-receptionist-be-py/README.md).

### 3. MQTT broker và relay

Cần Python và các gói trong `requirements.txt`. Sao chép [`.env.example`](iot_mqtt/.env.example) thành `.env` trong thư mục `iot_mqtt` nếu muốn thay đổi các giá trị mặc định.

```powershell
cd iot_mqtt
python -m pip install -r requirements.txt
python main.py
```

Broker mở MQTT TCP ở cổng `1883` và MQTT WebSocket ở `9001/mqtt` theo cấu hình mẫu. Có thể kiểm tra luồng không cần ESP32 bằng [`scripts/test_subscriber.py`](iot_mqtt/scripts/test_subscriber.py) và [`scripts/test_publisher.py`](iot_mqtt/scripts/test_publisher.py), mỗi script chạy trong một terminal riêng. Xem [README MQTT](iot_mqtt/README.md).

### 4. ESP32

Cần PlatformIO, bo mạch ESP32 và cảm biến PIR. Tạo `include/config.h` từ [`include/config.example.h`](esp32/include/config.example.h), rồi điền Wi-Fi, địa chỉ IPv4 của máy chạy broker, mã thiết bị và chân cảm biến. `config.h` đã được Git bỏ qua để không đưa mật khẩu lên repository. Đặt ESP32 và máy chạy broker trên mạng có thể kết nối với nhau. Nếu cổng serial khác `COM3`, sửa `upload_port` và `monitor_port` trong [`platformio.ini`](esp32/platformio.ini).

```powershell
cd esp32
Copy-Item include/config.example.h include/config.h
# Sửa include/config.h trước khi build.
pio run
pio run --target upload
pio device monitor
```

Luồng chương trình bắt đầu ở [`src/main.cpp`](esp32/src/main.cpp); mã kết nối và gửi MQTT nằm trong [`src/mqtt`](esp32/src/mqtt/).

### 5. Ứng dụng Expo

Cần Node.js/npm và môi trường chạy Expo. Tạo `.env` riêng trong `taekwondo-mobile-react-native` với địa chỉ phù hợp với thiết bị đang dùng:

```env
EXPO_PUBLIC_API_URL_JAVA=http://<IP_MAY_CHAY_JAVA>:8080/api/v1
EXPO_PUBLIC_MQTT_ENABLED=true
EXPO_PUBLIC_MQTT_BROKER_URL=ws://<IP_MAY_CHAY_BROKER>:9001/mqtt
EXPO_PUBLIC_MQTT_DEFAULT_TOPIC=taekwondo/events
```

Trên điện thoại thật, thay `<IP_...>` bằng địa chỉ LAN của máy chủ; `localhost` sẽ trỏ tới chính điện thoại. Nếu chưa thử MQTT, có thể bỏ ba biến `EXPO_PUBLIC_MQTT_*` và chạy ứng dụng với MQTT tắt.

```powershell
cd taekwondo-mobile-react-native
npm install
npm start
```

Dự án dùng cả thư viện native như Firebase và camera, vì vậy một số chức năng cần development build thay vì Expo Go. Các route ở [`src/app`](taekwondo-mobile-react-native/src/app/), màn hình và logic theo tính năng ở [`src/features`](taekwondo-mobile-react-native/src/features/), HTTP client ở [`src/infrastructure/http`](taekwondo-mobile-react-native/src/infrastructure/http/) và MQTT client ở [`src/infrastructure/mqtt`](taekwondo-mobile-react-native/src/infrastructure/mqtt/).

## Kiểm tra mã nguồn

Mỗi dự án có bộ lệnh riêng; chạy trong thư mục tương ứng sau khi cài dependencies:

```powershell
# ai-receptionist-be-py
python -m pytest

# ai-receptionist-web-be-java
.\mvnw.cmd test

# taekwondo-mobile-react-native
npm run typecheck
npm test
```

Để thử luồng IoT, khởi động `iot_mqtt`, chạy hai script publisher/subscriber, rồi kết nối ESP32 và ứng dụng Expo.
