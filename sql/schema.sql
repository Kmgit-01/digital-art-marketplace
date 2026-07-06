-- =========================================================
-- Digital Art Marketplace - Database Schema
-- Run this in Azure Portal -> your SQL Database -> Query editor
-- =========================================================

CREATE TABLE Users (
    UserId          INT IDENTITY(1,1) PRIMARY KEY,
    FullName        NVARCHAR(150)   NOT NULL,
    Email           NVARCHAR(255)   NOT NULL UNIQUE,
    PasswordHash    NVARCHAR(255)   NOT NULL,
    Role            NVARCHAR(20)    NOT NULL DEFAULT 'buyer',
    Bio             NVARCHAR(MAX)   NULL,
    ProfileImageUrl NVARCHAR(500)   NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Artworks (
    ArtworkId       INT IDENTITY(1,1) PRIMARY KEY,
    ArtistId        INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Title           NVARCHAR(200)   NOT NULL,
    Description     NVARCHAR(MAX)   NULL,
    Category        NVARCHAR(100)   NULL,
    Price           DECIMAL(10,2)   NOT NULL,
    OriginalFileUrl  NVARCHAR(500)  NOT NULL,
    PreviewImageUrl  NVARCHAR(500)  NOT NULL,
    IsSold          BIT             NOT NULL DEFAULT 0,
    RoyaltyPercent  DECIMAL(5,2)    NOT NULL DEFAULT 10.00,
    CreatedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Transactions (
    TransactionId   INT IDENTITY(1,1) PRIMARY KEY,
    ArtworkId       INT NOT NULL FOREIGN KEY REFERENCES Artworks(ArtworkId),
    BuyerId         INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    SellerId        INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Amount          DECIMAL(10,2)   NOT NULL,
    RoyaltyAmount   DECIMAL(10,2)   NOT NULL DEFAULT 0,
    PaymentStatus   NVARCHAR(20)    NOT NULL DEFAULT 'pending',
    PaymentRef      NVARCHAR(255)   NULL,
    TransactionDate DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Licenses (
    LicenseId       INT IDENTITY(1,1) PRIMARY KEY,
    ArtworkId       INT NOT NULL FOREIGN KEY REFERENCES Artworks(ArtworkId),
    OwnerId         INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    TransactionId   INT NOT NULL FOREIGN KEY REFERENCES Transactions(TransactionId),
    LicenseType     NVARCHAR(50)    NOT NULL DEFAULT 'personal',
    IssuedAt        DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME(),
    CertificateHash NVARCHAR(255)   NULL
);

CREATE TABLE Royalties (
    RoyaltyId       INT IDENTITY(1,1) PRIMARY KEY,
    ArtworkId       INT NOT NULL FOREIGN KEY REFERENCES Artworks(ArtworkId),
    ArtistId        INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    TransactionId   INT NOT NULL FOREIGN KEY REFERENCES Transactions(TransactionId),
    Amount          DECIMAL(10,2)   NOT NULL,
    PaidAt          DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE TABLE Comments (
    CommentId       INT IDENTITY(1,1) PRIMARY KEY,
    ArtworkId       INT NOT NULL FOREIGN KEY REFERENCES Artworks(ArtworkId),
    UserId          INT NOT NULL FOREIGN KEY REFERENCES Users(UserId),
    Content         NVARCHAR(1000)  NOT NULL,
    CreatedAt       DATETIME2       NOT NULL DEFAULT SYSUTCDATETIME()
);

CREATE INDEX IX_Artworks_ArtistId ON Artworks(ArtistId);
CREATE INDEX IX_Transactions_ArtworkId ON Transactions(ArtworkId);
CREATE INDEX IX_Comments_ArtworkId ON Comments(ArtworkId);
