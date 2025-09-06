-- Insert a default admin user (password: admin123)
INSERT INTO users (first_name, last_name, email, password) 
VALUES ('Admin', 'User', 'admin@2bentrods.com', 'admin123')
ON DUPLICATE KEY UPDATE id=id; 


-- Insert a default staff user
INSERT INTO users (first_name, last_name, email, password) 
VALUES ('Sonny', 'User', 'sonnytest@test.com', 'user123')
ON DUPLICATE KEY UPDATE id=id; 


-- Insert another default staff user
INSERT INTO users (first_name, last_name, email, password) 
VALUES ('Evan', 'User', 'evan@test.com', 'user123')
ON DUPLICATE KEY UPDATE id=id; 


INSERT INTO locations (name, address)
VALUES ('Alberta Park', '111 Test Drive, Noosa, 4110'),
       ('Bald Hills Boat Ramp', '222 Example Street, Brisbane, 4000'),
       ('Bellara - Pirate Park', '333 Sample Road, Sydney, 2000'),
       ('Boat Ramp Cribb Park', '444 Demo Avenue, Melbourne, 3000'),
       ('Chambers Island', '555 Trial Boulevard, Perth, 6000');

INSERT INTO shifts (id, status, date, start_time, end_time, uid, location_id, notes)
VALUES ('1','Accepted', '2025-08-01', '12:00:00', '16:00:00', 2, 1, 'School excursion. 50+ students. Arrive early.'),
('1','Open', '2025-08-02', '09:00:00', '13:00:00', 3, 2, 'School excursion. 50+ students. Arrive early.'),
('2','Request', '2025-08-03', '10:00:00', '14:00:00', 3, 3, ''),
('2','Declined', '2025-08-04', '08:30:00', '12:30:00', 2, 4, ''),
('3','Pending', '2025-08-08', '11:00:00', '12:00:00', 3, 2, ''),
('4','Unassigned', '2025-08-02', '07:00:00', '11:00:00', 3, 3, '');

INSERT INTO unavailabilities (id, user_id, start_date, end_date, day_of_week, start_time, end_time) VALUES 
(1,2,'2025-08-06',NULL,'Wednesday','13:00:00','18:00:00'),
(2,2,'2025-08-09',NULL,'Saturday','14:00:00','20:00:00'),
(3,2,'2025-08-26','2025-08-26',NULL,'00:00:00','23:59:59'),
(1,3,'2025-08-05',NULL,'Monday','09:00:00','17:00:00'),
(2,3,'2025-08-07',NULL,'Friday','08:00:00','12:00:00'),
(3,3,'2025-08-25','2025-08-25',NULL,'00:00:00','23:59:59');


-- Adjust foreign keys to existing data
-- Insert for new table format
INSERT INTO `shifts`(`status`, `date`, `start_time`, `end_time`, `assignee_id`, `location_id`, `notes`, `type`) VALUES 
('Accepted', '2025-08-01', '12:00:00', '16:00:00', 2, 1, 'School excursion. 50+ students. Arrive early.', 'shift'),
('Open', '2025-08-02', '09:00:00', '13:00:00', 12, 2, 'School excursion. 50+ students. Arrive early.', 'shift'),
('Request', '2025-08-03', '10:00:00', '14:00:00', 7, 3, '', 'shift'),
('Declined', '2025-08-04', '08:30:00', '12:30:00', 8, 4, '', 'shift'),
('Pending', '2025-08-08', '11:00:00', '12:00:00', 7, 2, '', 'shift'),
('Unassigned', '2025-08-02', '07:00:00', '11:00:00', 12, 3, '', 'shift');

-- Unavailability
INSERT INTO `shifts`(`assignee_id`, `date`, `end_date`, `day_of_week`, `start_time`, `end_time`, `type`) VALUES 
(8,'2025-08-06',NULL,'Wednesday','13:00:00','18:00:00', 'unavailability'),
(7,'2025-08-09',NULL,'Saturday','14:00:00','20:00:00', 'unavailability'),
(12,'2025-08-05',NULL,'Monday','09:00:00','17:00:00', 'unavailability'),
(12,'2025-08-07',NULL,'Friday','08:00:00','12:00:00', 'unavailability');

-- Leave
INSERT INTO `shifts`(`assignee_id`, `date`, `end_date`, `recurrence`, `start_time`, `end_time`, `reason`, `type`) VALUES 
(12,'2025-08-26','2025-08-26', NULL ,'00:00:00','23:59:59', NULL, 'leave'),
(8,'2025-08-25','2025-09-10', NULL,'00:00:00','23:59:59', 'On vacation', 'leave');
