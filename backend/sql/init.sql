-- HR System Database Initialization
-- Run: mysql -u root -p < sql/init.sql

CREATE DATABASE IF NOT EXISTS hr_system DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hr_system;

-- Users table
CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role ENUM('admin', 'manager', 'viewer') NOT NULL DEFAULT 'viewer',
  avatar VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Departments table
CREATE TABLE IF NOT EXISTS departments (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  leader_id INT,
  parent_id INT DEFAULT NULL,
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (parent_id) REFERENCES departments(id) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Employees table
CREATE TABLE IF NOT EXISTS employees (
  id INT PRIMARY KEY AUTO_INCREMENT,
  name VARCHAR(50) NOT NULL,
  gender ENUM('male', 'female') NOT NULL,
  department_id INT NOT NULL,
  position VARCHAR(100) NOT NULL,
  salary DECIMAL(10,2) NOT NULL,
  entry_date DATE NOT NULL,
  status ENUM('active', 'inactive', 'probation') NOT NULL DEFAULT 'probation',
  email VARCHAR(100) NOT NULL UNIQUE,
  phone VARCHAR(20) NOT NULL,
  avatar VARCHAR(255),
  created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  FOREIGN KEY (department_id) REFERENCES departments(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Seed: departments (2=技术部,3=产品部,4=市场部,5=人事部,6=前端组,7=后端组,8=测试组)
INSERT INTO departments (id, name, parent_id) VALUES
(2, '技术部', NULL),
(3, '产品部', NULL),
(4, '市场部', NULL),
(5, '人事部', NULL),
(6, '前端组', 2),
(7, '后端组', 2),
(8, '测试组', 2);

-- Seed: admin user (password: password)
INSERT INTO users (username, password, role) VALUES
('admin', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin'),
('manager', '$2a$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'manager');

-- Seed: employees (dept IDs: 2=技术部,3=产品部,4=市场部,5=人事部,6=前端组,7=后端组,8=测试组)
INSERT INTO employees (name, gender, department_id, position, salary, entry_date, status, email, phone) VALUES
('张伟', 'male', 6, '高级前端工程师', 22000, '2022-03-15', 'active', 'zhangwei@example.com', '13800001001'),
('李娜', 'female', 6, '前端工程师', 15000, '2023-06-01', 'active', 'lina@example.com', '13800001002'),
('王强', 'male', 7, '高级后端工程师', 25000, '2021-09-10', 'active', 'wangqiang@example.com', '13800001003'),
('刘洋', 'male', 7, '后端工程师', 18000, '2023-01-15', 'probation', 'liuyang@example.com', '13800001004'),
('陈静', 'female', 8, '测试工程师', 14000, '2022-11-20', 'active', 'chenjing@example.com', '13800001005'),
('赵磊', 'male', 3, '产品经理', 20000, '2021-05-08', 'active', 'zhaolei@example.com', '13800001006'),
('孙丽', 'female', 3, '产品助理', 12000, '2024-02-01', 'probation', 'sunli@example.com', '13800001007'),
('周杰', 'male', 4, '市场总监', 28000, '2020-07-20', 'active', 'zhoujie@example.com', '13800001008'),
('吴芳', 'female', 4, '市场专员', 11000, '2023-08-15', 'active', 'wufang@example.com', '13800001009'),
('郑博', 'male', 5, '人事经理', 18000, '2021-12-01', 'active', 'zhengbo@example.com', '13800001010'),
('林晓', 'female', 5, '人事专员', 10000, '2024-01-08', 'probation', 'linxiao@example.com', '13800001011'),
('黄明', 'male', 6, '前端实习生', 6000, '2024-03-01', 'probation', 'huangming@example.com', '13800001012'),
('徐慧', 'female', 7, '后端工程师', 19000, '2022-07-15', 'active', 'xuhui@example.com', '13800001013'),
('朱刚', 'male', 2, '技术总监', 35000, '2019-06-01', 'active', 'zhugang@example.com', '13800001014'),
('宋婷', 'female', 8, '高级测试工程师', 17000, '2021-04-20', 'active', 'songting@example.com', '13800001015'),
('韩鹏', 'male', 6, '前端工程师', 16000, '2023-03-10', 'active', 'hanpeng@example.com', '13800001016'),
('曹雪', 'female', 3, '高级产品经理', 23000, '2020-09-15', 'active', 'caoxue@example.com', '13800001017'),
('杨帆', 'male', 7, '架构师', 38000, '2018-11-01', 'active', 'yangfan@example.com', '13800001018'),
('许娜', 'female', 4, '市场经理', 21000, '2021-03-22', 'active', 'xuna@example.com', '13800001019'),
('邓超', 'male', 8, '测试经理', 22000, '2020-08-10', 'inactive', 'dengchao@example.com', '13800001020');

-- Update department leaders
UPDATE departments SET leader_id = (SELECT id FROM employees WHERE name = '朱刚') WHERE id = 2;
UPDATE departments SET leader_id = (SELECT id FROM employees WHERE name = '张伟') WHERE id = 6;
UPDATE departments SET leader_id = (SELECT id FROM employees WHERE name = '杨帆') WHERE id = 7;
UPDATE departments SET leader_id = (SELECT id FROM employees WHERE name = '邓超') WHERE id = 8;
UPDATE departments SET leader_id = (SELECT id FROM employees WHERE name = '赵磊') WHERE id = 3;
UPDATE departments SET leader_id = (SELECT id FROM employees WHERE name = '周杰') WHERE id = 4;
UPDATE departments SET leader_id = (SELECT id FROM employees WHERE name = '郑博') WHERE id = 5;
