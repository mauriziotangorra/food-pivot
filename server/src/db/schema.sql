-- Portale Gestione Crisi IFP - normalized MySQL schema (3NF)
CREATE DATABASE IF NOT EXISTS ifp_crisis
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

USE ifp_crisis;

-- Accounts for the internal Safety/Crisis team.
CREATE TABLE IF NOT EXISTS users (
  id INT AUTO_INCREMENT PRIMARY KEY,
  full_name VARCHAR(150) NOT NULL,
  email VARCHAR(190) NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  role ENUM('admin', 'operator') NOT NULL DEFAULT 'operator',
  is_active TINYINT(1) NOT NULL DEFAULT 1,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_users_email (email)
) ENGINE=InnoDB;

-- Ragione Sociale of the reporting customer. Reused across tickets.
CREATE TABLE IF NOT EXISTS customers (
  id INT AUTO_INCREMENT PRIMARY KEY,
  company_name VARCHAR(200) NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_customers_company_name (company_name)
) ENGINE=InnoDB;

-- Referente for a customer. A customer can have several contacts over time.
CREATE TABLE IF NOT EXISTS contacts (
  id INT AUTO_INCREMENT PRIMARY KEY,
  customer_id INT NOT NULL,
  first_name VARCHAR(100) NOT NULL,
  last_name VARCHAR(100) NOT NULL,
  phone VARCHAR(40) NOT NULL DEFAULT '',
  email VARCHAR(190) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_contacts_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
  UNIQUE KEY uq_contacts_identity (customer_id, first_name, last_name, phone, email),
  INDEX idx_contacts_customer (customer_id)
) ENGINE=InnoDB;

-- Product master data. Batch/expiry are lot-specific and stay on the ticket.
CREATE TABLE IF NOT EXISTS products (
  id INT AUTO_INCREMENT PRIMARY KEY,
  name VARCHAR(200) NOT NULL,
  ifp_code VARCHAR(50) NOT NULL,
  ean_code VARCHAR(50) NOT NULL DEFAULT '',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  UNIQUE KEY uq_products_ifp_code (ifp_code)
) ENGINE=InnoDB;

-- One crisis case ("protocollo").
CREATE TABLE IF NOT EXISTS tickets (
  id VARCHAR(10) PRIMARY KEY,
  customer_id INT NOT NULL,
  contact_id INT NOT NULL,
  product_id INT NOT NULL,
  batch_number VARCHAR(100) NOT NULL,
  expiry_date DATE NOT NULL,
  subject TEXT NOT NULL,
  record_type ENUM('non_conformity', 'complaint') NOT NULL DEFAULT 'non_conformity',
  reference_document TEXT NULL,
  supplier VARCHAR(200) NULL,
  issue_type VARCHAR(150) NULL,
  issue_subtype VARCHAR(150) NULL,
  severity VARCHAR(30) NULL,
  found_by VARCHAR(150) NULL,
  edited_by VARCHAR(150) NULL,
  analysis_causes TEXT NULL,
  resolution_manager VARCHAR(150) NULL,
  corrective_action TEXT NULL,
  immediate_action TEXT NULL,
  improvement_objectives TEXT NULL,
  expected_closing_date DATE NULL,
  closing_date DATE NULL,
  effectiveness_check TINYINT(1) NULL,
  effectiveness_verification_date DATE NULL,
  origin VARCHAR(80) NULL,
  complaint_assessment VARCHAR(30) NULL,
  status ENUM('Aperto', 'In Corso', 'Risolto') NOT NULL DEFAULT 'Aperto',
  created_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  resolved_at DATETIME NULL,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  CONSTRAINT fk_tickets_customer FOREIGN KEY (customer_id) REFERENCES customers(id),
  CONSTRAINT fk_tickets_contact FOREIGN KEY (contact_id) REFERENCES contacts(id),
  CONSTRAINT fk_tickets_product FOREIGN KEY (product_id) REFERENCES products(id),
  CONSTRAINT fk_tickets_created_by FOREIGN KEY (created_by) REFERENCES users(id),
  INDEX idx_tickets_status (status),
  INDEX idx_tickets_created_at (created_at)
) ENGINE=InnoDB;

-- Chronological operational notes on a ticket.
CREATE TABLE IF NOT EXISTS follow_ups (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(10) NOT NULL,
  user_id INT NOT NULL,
  note TEXT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_followups_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_followups_user FOREIGN KEY (user_id) REFERENCES users(id),
  INDEX idx_followups_ticket (ticket_id)
) ENGINE=InnoDB;

-- Photos / lab reports / supplier letters attached to a ticket, stored on disk.
CREATE TABLE IF NOT EXISTS attachments (
  id BIGINT AUTO_INCREMENT PRIMARY KEY,
  ticket_id VARCHAR(10) NOT NULL,
  type ENUM('photo', 'report', 'supplier_letter') NOT NULL,
  original_name VARCHAR(255) NOT NULL,
  stored_filename VARCHAR(255) NOT NULL,
  mime_type VARCHAR(100) NOT NULL,
  size_bytes INT NOT NULL,
  uploaded_by INT NOT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT fk_attachments_ticket FOREIGN KEY (ticket_id) REFERENCES tickets(id) ON DELETE CASCADE,
  CONSTRAINT fk_attachments_user FOREIGN KEY (uploaded_by) REFERENCES users(id),
  INDEX idx_attachments_ticket_type (ticket_id, type)
) ENGINE=InnoDB;
