-- =============================================
-- Hotel Management System Database Initialization
-- 酒店管理系统数据库初始化脚本
-- 运行: mysql -u root -p < sql/init.sql
-- 说明: 日期用 CURDATE() 相对偏移，任意时间运行都有「今日入住/退房」数据
-- =============================================

CREATE DATABASE IF NOT EXISTS hotel_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hotel_system;

-- ---------------------------------------------------------------
-- 1. 用户表（管理员/前台，RBAC，密码统一为 password）
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'viewer') NOT NULL DEFAULT 'viewer',
  avatar VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------
-- 2. 房型表（无父子关系，扁平列表）
--    字段：name/base_price/bed_type/area/max_guests/description
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS room_types (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL UNIQUE COMMENT '房型名称',
  base_price DECIMAL(10,2) NOT NULL COMMENT '基础房价',
  bed_type VARCHAR(30) NOT NULL DEFAULT '大床' COMMENT '床型',
  area DECIMAL(6,2) COMMENT '面积(㎡)',
  max_guests INT NOT NULL DEFAULT 2 COMMENT '最大入住人数',
  description VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------
-- 3. 客房表（N:1 属于房型；status 为房态）
--    房态: available 空闲 / occupied 入住 / dirty 脏房 / maintenance 维修
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS rooms (
  id INT PRIMARY KEY AUTO_INCREMENT,
  room_number VARCHAR(10) NOT NULL UNIQUE COMMENT '房号',
  floor INT NOT NULL COMMENT '楼层',
  type_id INT NOT NULL,
  status ENUM('available', 'occupied', 'dirty', 'maintenance') NOT NULL DEFAULT 'available',
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (type_id) REFERENCES room_types(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ---------------------------------------------------------------
-- 4. 订单 / 入住单表
--    状态: reserved 已预订 / checked_in 已入住 / checked_out 已退房 / cancelled 已取消
-- ---------------------------------------------------------------
CREATE TABLE IF NOT EXISTS orders (
  id INT PRIMARY KEY AUTO_INCREMENT,
  order_no VARCHAR(20) NOT NULL UNIQUE COMMENT '订单号 HC + 日期 + 序号',
  guest_name VARCHAR(50) NOT NULL COMMENT '住客姓名',
  guest_phone VARCHAR(20) NOT NULL COMMENT '住客手机',
  guest_id_card VARCHAR(18) COMMENT '身份证号',
  room_id INT NOT NULL,
  check_in DATE NOT NULL,
  check_out DATE NOT NULL,
  nights INT NOT NULL COMMENT '入住天数',
  total_amount DECIMAL(10,2) NOT NULL COMMENT '订单总额 = nights * 房价',
  deposit DECIMAL(10,2) DEFAULT 0 COMMENT '押金',
  status ENUM('reserved', 'checked_in', 'checked_out', 'cancelled') NOT NULL DEFAULT 'reserved',
  remark VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (room_id) REFERENCES rooms(id),
  INDEX idx_room_date (room_id, check_in, check_out),
  INDEX idx_status (status)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- =============================================
-- 种子数据
-- =============================================

-- 房型：1=大床房(388) 2=双床房(428) 3=豪华大床房(688) 4=商务套房(988) 5=全景套房(1688)
INSERT INTO room_types (id, name, base_price, bed_type, area, max_guests, description) VALUES
(1, '大床房',     388.00, '大床',  28.00, 2, '温馨大床，免费 WiFi，含早餐'),
(2, '双床房',     428.00, '双床',  32.00, 2, '标准双床，适合商务出行'),
(3, '豪华大床房', 688.00, '大床',  40.00, 3, '宽敞豪华，城市景观，含早'),
(4, '商务套房',   988.00, '大床',  58.00, 3, '独立客厅，商务会客优选'),
(5, '全景套房',  1688.00, '大床',  86.00, 4, '顶层全景，管家服务，奢华体验');

-- 客房：8楼大床 / 9楼双床 / 10楼豪华大床 / 11楼商务套房 / 12楼全景套房
-- 房态与「在住订单」严格对应：occupied = {102,113,118,121}；dirty = {103,110,115}
INSERT INTO rooms (id, room_number, floor, type_id, status) VALUES
(101, '801',  8, 1, 'available'),
(102, '802',  8, 1, 'occupied'),
(103, '803',  8, 1, 'dirty'),
(104, '804',  8, 1, 'available'),
(105, '805',  8, 1, 'maintenance'),
(106, '806',  8, 1, 'available'),
(107, '901',  9, 2, 'available'),
(108, '902',  9, 2, 'available'),
(109, '903',  9, 2, 'available'),
(110, '904',  9, 2, 'dirty'),
(111, '905',  9, 2, 'available'),
(112, '906',  9, 2, 'available'),
(113, '1001', 10, 3, 'occupied'),
(114, '1002', 10, 3, 'available'),
(115, '1003', 10, 3, 'dirty'),
(116, '1004', 10, 3, 'available'),
(117, '1101', 11, 4, 'available'),
(118, '1102', 11, 4, 'occupied'),
(119, '1103', 11, 4, 'available'),
(120, '1201', 12, 5, 'available'),
(121, '1202', 12, 5, 'occupied');

-- 管理员 / 前台账号（密码统一为 password，bcrypt hash）
INSERT INTO users (username, password, role) VALUES
('admin',   '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager');

-- =============================================
-- 订单种子数据（21 条，跨近 6 个月）
-- 单价: 大床388 / 双床428 / 豪华688 / 套房988 / 全景1688
-- 一、历史已退房（12 条，按月分布，撑营收趋势）
INSERT INTO orders (order_no, guest_name, guest_phone, guest_id_card, room_id, check_in, check_out, nights, total_amount, deposit, status, remark, created_at) VALUES
('HC20260105001', '王建国', '13900001001', '310101199001011234', 101, CURDATE() - INTERVAL 5 MONTH, CURDATE() - INTERVAL 5 MONTH + INTERVAL 2 DAY, 2,  776.00,  500, 'checked_out', '老客户',     CURDATE() - INTERVAL 5 MONTH),
('HC20260120002', '李素芬', '13900001002', '310102198802022345', 107, CURDATE() - INTERVAL 5 MONTH + INTERVAL 15 DAY, CURDATE() - INTERVAL 5 MONTH + INTERVAL 17 DAY, 2, 856.00, 500, 'checked_out', NULL,       CURDATE() - INTERVAL 5 MONTH + INTERVAL 15 DAY),
('HC20260208003', '张志强', '13900001003', '310103199203033456', 113, CURDATE() - INTERVAL 4 MONTH, CURDATE() - INTERVAL 4 MONTH + INTERVAL 3 DAY, 3, 2064.00, 1000, 'checked_out', '蜜月旅行',   CURDATE() - INTERVAL 4 MONTH),
('HC20260225004', '陈丽华', '13900001004', '310104198504044567', 117, CURDATE() - INTERVAL 4 MONTH + INTERVAL 20 DAY, CURDATE() - INTERVAL 4 MONTH + INTERVAL 23 DAY, 3, 2964.00, 1000, 'checked_out', NULL,     CURDATE() - INTERVAL 4 MONTH + INTERVAL 20 DAY),
('HC20260310005', '刘德海', '13900001005', '310105199005055678', 102, CURDATE() - INTERVAL 3 MONTH, CURDATE() - INTERVAL 3 MONTH + INTERVAL 4 DAY, 4, 1552.00, 500, 'checked_out', '出差',       CURDATE() - INTERVAL 3 MONTH),
('HC20260322006', '赵敏',   '13900001006', '310106199206066789', 108, CURDATE() - INTERVAL 3 MONTH + INTERVAL 18 DAY, CURDATE() - INTERVAL 3 MONTH + INTERVAL 19 DAY, 1, 428.00, 500, 'checked_out', NULL,     CURDATE() - INTERVAL 3 MONTH + INTERVAL 18 DAY),
('HC20260405007', '孙伟',   '13900001007', '310107198907077890', 120, CURDATE() - INTERVAL 2 MONTH, CURDATE() - INTERVAL 2 MONTH + INTERVAL 2 DAY, 2, 3376.00, 2000, 'checked_out', '纪念日套房', CURDATE() - INTERVAL 2 MONTH),
('HC20260418008', '周慧',   '13900001008', '310108199408088901', 114, CURDATE() - INTERVAL 2 MONTH + INTERVAL 12 DAY, CURDATE() - INTERVAL 2 MONTH + INTERVAL 14 DAY, 2, 1376.00, 1000, 'checked_out', NULL,   CURDATE() - INTERVAL 2 MONTH + INTERVAL 12 DAY),
('HC20260502009', '吴军',   '13900001009', '310109198709099012', 109, CURDATE() - INTERVAL 1 MONTH, CURDATE() - INTERVAL 1 MONTH + INTERVAL 3 DAY, 3, 1284.00, 500, 'checked_out', '家庭出游',   CURDATE() - INTERVAL 1 MONTH),
('HC20260515010', '郑婷',   '13900001010', '310110199310100123', 118, CURDATE() - INTERVAL 1 MONTH + INTERVAL 15 DAY, CURDATE() - INTERVAL 1 MONTH + INTERVAL 17 DAY, 2, 1976.00, 1000, 'checked_out', '商务续住', CURDATE() - INTERVAL 1 MONTH + INTERVAL 15 DAY),
('HC20260605011', '黄磊',   '13900001011', '310111198511111234', 104, CURDATE() - INTERVAL 20 DAY, CURDATE() - INTERVAL 18 DAY, 2, 776.00, 500, 'checked_out', NULL,         CURDATE() - INTERVAL 20 DAY),
('HC20260613012', '林娜',   '13900001012', '310112199212122345', 116, CURDATE() - INTERVAL 12 DAY, CURDATE() - INTERVAL 11 DAY, 1, 688.00, 500, 'checked_out', NULL,         CURDATE() - INTERVAL 12 DAY);

-- 二、今日退房（2 条，撑「今日营收」；房间对应 dirty 待保洁）
INSERT INTO orders (order_no, guest_name, guest_phone, guest_id_card, room_id, check_in, check_out, nights, total_amount, deposit, status, remark, created_at) VALUES
('HC20260624013', '钱伟', '13900001013', '310113198903133456', 103, CURDATE() - INTERVAL 1 DAY, CURDATE(), 1, 388.00, 500, 'checked_out', '今日退房', CURDATE() - INTERVAL 1 DAY),
('HC20260623014', '冯静', '13900001014', '310114199404144567', 110, CURDATE() - INTERVAL 2 DAY, CURDATE(), 2, 856.00, 500, 'checked_out', '今日退房', CURDATE() - INTERVAL 2 DAY);

-- 三、今日入住（3 条，撑「今日入住」；房间 occupied）
INSERT INTO orders (order_no, guest_name, guest_phone, guest_id_card, room_id, check_in, check_out, nights, total_amount, deposit, status, remark, created_at) VALUES
('HC20260625015', '徐涛', '13900001015', '310115198805155678', 113, CURDATE(), CURDATE() + INTERVAL 3 DAY, 3, 2064.00, 1000, 'checked_in', '今日入住-豪华', CURDATE()),
('HC20260625016', '曹颖', '13900001016', '310116199206166789', 118, CURDATE(), CURDATE() + INTERVAL 2 DAY, 2, 1976.00, 1000, 'checked_in', '今日入住-套房', CURDATE()),
('HC20260625017', '许琳', '13900001017', '310117199507177890', 121, CURDATE(), CURDATE() + INTERVAL 1 DAY, 1, 1688.00, 2000, 'checked_in', '今日入住-全景', CURDATE());

-- 四、在住（checked_in，入住在昨天，房间 occupied）
INSERT INTO orders (order_no, guest_name, guest_phone, guest_id_card, room_id, check_in, check_out, nights, total_amount, deposit, status, remark, created_at) VALUES
('HC20260624018', '邓超', '13900001018', '310118198708188901', 102, CURDATE() - INTERVAL 1 DAY, CURDATE() + INTERVAL 2 DAY, 3, 1164.00, 500, 'checked_in', '在住', CURDATE() - INTERVAL 1 DAY);

-- 五、预订（reserved，未入住）
INSERT INTO orders (order_no, guest_name, guest_phone, guest_id_card, room_id, check_in, check_out, nights, total_amount, deposit, status, remark, created_at) VALUES
('HC20260625019', '韩雪', '13900001019', '310119199309199012', 101, CURDATE() + INTERVAL 2 DAY, CURDATE() + INTERVAL 4 DAY, 2, 776.00, 500, 'reserved', '商务预订', CURDATE()),
('HC20260626020', '杨光', '13900001020', '310120198810200123', 115, CURDATE() + INTERVAL 5 DAY, CURDATE() + INTERVAL 7 DAY, 2, 1376.00, 1000, 'reserved', '家庭预订', CURDATE() - INTERVAL 2 DAY);

-- 六、已取消
INSERT INTO orders (order_no, guest_name, guest_phone, guest_id_card, room_id, check_in, check_out, nights, total_amount, deposit, status, remark, created_at) VALUES
('HC20260615021', '秦风', '13900001021', '310121199411211234', 108, CURDATE() - INTERVAL 5 DAY, CURDATE() - INTERVAL 4 DAY, 1, 428.00, 500, 'cancelled', '客户取消', CURDATE() - INTERVAL 8 DAY);
