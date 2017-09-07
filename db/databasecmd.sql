--database comands --

CREATE DATABASE booksharing;

CREATE TABLE `User` (
    id INT NOT NULL AUTO_INCREMENT,
    firstName varchar(40),
    lastName varchar(40),
    phone varchar(60),
    email VARCHAR(50) NOT NULL,
    password CHAR(60) NOT NULL,
    PRIMARY KEY (`id`),
    UNIQUE INDEX `email_UNIQUE` (`email` ASC)
);

CREATE TABLE `Book` (
    bookId int NOT NULL PRIMARY KEY AUTO_INCREMENT,
    title varchar(60),
    description varchar(255),
    bookAuthor varchar(255),
    publisher varchar(60),
    publishedYear numeric(4),
    ownerId int not null,
    FOREIGN KEY (ownerId) REFERENCES `User`(id));


CREATE TABLE `Booking` (
    id int NOT null AUTO_INCREMENT,
    bookId int,
    bookingDate datetime,
    userId int,
    status varchar(30) default 'pending',
    INDEX (bookId),
    INDEX (userId),
    PRIMARY KEY (id),
    FOREIGN KEY (userId) REFERENCES `User`(id),
    FOREIGN KEY (bookId) REFERENCES `Book`(bookId));

CREATE TABLE `Subscription` (
    id INT PRIMARY KEY NOT NULL AUTO_INCREMENT,
    auth varchar(256),
    endpoint text,
    p256dh varchar(256)
    );