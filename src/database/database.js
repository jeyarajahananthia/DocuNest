
import * as SQLite from 'expo-sqlite';

let db;

export async function initializeDatabase() {
  db = await SQLite.openDatabaseAsync('docunest.db');

  // Enable foreign key relationships
  await db.execAsync('PRAGMA foreign_keys = ON;');

  // Create Categories table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL UNIQUE,
      description TEXT
    );
  `);

  // Create Documents table
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT,
      fileType TEXT NOT NULL,
      fileSize INTEGER DEFAULT 0,
      categoryId INTEGER,
      dateAdded TEXT NOT NULL,
      fileUri TEXT,
      isFavorite INTEGER DEFAULT 0,
      FOREIGN KEY (categoryId)
        REFERENCES categories(id)
        ON DELETE SET NULL
    );
  `);

  // Insert sample data only when database is empty
  await seedDatabase();

  return db;
}

// Create our own sample dataset
async function seedDatabase() {
  const result = await db.getFirstAsync(
    'SELECT COUNT(*) AS count FROM documents'
  );

  if (result.count > 0) {
    return;
  }

  const sampleCategories = [
    {
      name: 'University',
      description: 'University notes and academic documents',
    },
    {
      name: 'Personal',
      description: 'Personal documents and records',
    },
    {
      name: 'Work',
      description: 'Work-related documents',
    },
    {
      name: 'Finance',
      description: 'Financial documents and records',
    },
    {
      name: 'Other',
      description: 'Other important documents',
    },
  ];

  for (const category of sampleCategories) {
    await db.runAsync(
      'INSERT OR IGNORE INTO categories (name, description) VALUES (?, ?)',
      [category.name, category.description]
    );
  }

  const categories = await db.getAllAsync(
    'SELECT id, name FROM categories'
  );

  const categoryMap = {};

  categories.forEach((category) => {
    categoryMap[category.name] = category.id;
  });

  const getDate = (daysAgo) => {
    const date = new Date();
    date.setDate(date.getDate() - daysAgo);
    return date.toISOString();
  };

  const sampleDocuments = [
    {
      name: 'Mobile Computing Notes',
      description: 'Mobile IP lecture notes',
      fileType: 'PDF',
      fileSize: 1024000,
      category: 'University',
      daysAgo: 1,
    },
    {
      name: 'Software Testing Assignment',
      description: 'Postman and JMeter assignment',
      fileType: 'PDF',
      fileSize: 850000,
      category: 'University',
      daysAgo: 2,
    },
    {
      name: 'React Native Tutorial',
      description: 'React Native learning materials',
      fileType: 'PDF',
      fileSize: 1500000,
      category: 'University',
      daysAgo: 3,
    },
    {
      name: 'Database Management Notes',
      description: 'Database lecture materials',
      fileType: 'DOCX',
      fileSize: 750000,
      category: 'University',
      daysAgo: 5,
    },
    {
      name: 'Network Security Slides',
      description: 'Computer security study materials',
      fileType: 'PPTX',
      fileSize: 2200000,
      category: 'University',
      daysAgo: 7,
    },
    {
      name: 'My CV',
      description: 'Personal curriculum vitae',
      fileType: 'PDF',
      fileSize: 350000,
      category: 'Personal',
      daysAgo: 4,
    },
    {
      name: 'Personal ID Copy',
      description: 'Personal identification record',
      fileType: 'JPG',
      fileSize: 500000,
      category: 'Personal',
      daysAgo: 8,
    },
    {
      name: 'Personal Information',
      description: 'Personal information document',
      fileType: 'DOCX',
      fileSize: 450000,
      category: 'Personal',
      daysAgo: 10,
    },
    {
      name: 'Project Proposal',
      description: 'Project planning document',
      fileType: 'PDF',
      fileSize: 900000,
      category: 'Work',
      daysAgo: 6,
    },
    {
      name: 'Meeting Report',
      description: 'Project meeting report',
      fileType: 'DOCX',
      fileSize: 600000,
      category: 'Work',
      daysAgo: 9,
    },
    {
      name: 'Monthly Budget',
      description: 'Monthly expense calculations',
      fileType: 'XLSX',
      fileSize: 400000,
      category: 'Finance',
      daysAgo: 2,
    },
    {
      name: 'Payment Receipt',
      description: 'Payment transaction receipt',
      fileType: 'PDF',
      fileSize: 250000,
      category: 'Finance',
      daysAgo: 11,
    },
    {
      name: 'Bank Statement',
      description: 'Sample bank statement record',
      fileType: 'PDF',
      fileSize: 700000,
      category: 'Finance',
      daysAgo: 15,
    },
    {
      name: 'Travel Photograph',
      description: 'Travel memory photograph',
      fileType: 'JPG',
      fileSize: 1800000,
      category: 'Other',
      daysAgo: 12,
    },
    {
      name: 'Important Information',
      description: 'Other important information',
      fileType: 'PDF',
      fileSize: 550000,
      category: 'Other',
      daysAgo: 14,
    },
  ];

  for (const doc of sampleDocuments) {
    await db.runAsync(
      `INSERT INTO documents
      (name, description, fileType, fileSize, categoryId, dateAdded)
      VALUES (?, ?, ?, ?, ?, ?)`,
      [
        doc.name,
        doc.description,
        doc.fileType,
        doc.fileSize,
        categoryMap[doc.category],
        getDate(doc.daysAgo),
      ]
    );
  }

  console.log('DocuNest sample dataset inserted successfully!');
}

// Retrieve all documents
export async function getAllDocuments() {
  return await db.getAllAsync(`
    SELECT documents.*, categories.name AS categoryName
    FROM documents
    LEFT JOIN categories
    ON documents.categoryId = categories.id
    ORDER BY dateAdded DESC
  `);
}

// Retrieve all categories
export async function getCategories() {
  return await db.getAllAsync(`
    SELECT categories.*, COUNT(documents.id) AS documentCount
    FROM categories
    LEFT JOIN documents
    ON categories.id = documents.categoryId
    GROUP BY categories.id
    ORDER BY categories.name ASC
  `);
}


// CREATE: Add a new category
export async function addCategory(name, description) {
  const categoryName = name.trim();
  const categoryDescription = description.trim();

  if (!categoryName) {
    throw new Error('Category name is required.');
  }

  const result = await db.runAsync(
    `INSERT INTO categories (name, description)
     VALUES (?, ?)`,
    [categoryName, categoryDescription]
  );

  return result;
}

// UPDATE: Edit an existing category
export async function updateCategory(id, name, description) {
  const categoryName = name.trim();
  const categoryDescription = description.trim();

  if (!categoryName) {
    throw new Error('Category name is required.');
  }

  const result = await db.runAsync(
    `UPDATE categories
     SET name = ?, description = ?
     WHERE id = ?`,
    [categoryName, categoryDescription, id]
  );

  if (result.changes === 0) {
    throw new Error('Category not found.');
  }

  return result;
}

// DELETE: Remove a category
export async function deleteCategory(id) {
  const result = await db.runAsync(
    'DELETE FROM categories WHERE id = ?',
    [id]
  );

  if (result.changes === 0) {
    throw new Error('Category not found.');
  }

  return result;
}


// Retrieve recently added documents
export async function getRecentDocuments() {
  return await db.getAllAsync(`
    SELECT documents.*, categories.name AS categoryName
    FROM documents
    LEFT JOIN categories
    ON documents.categoryId = categories.id
    ORDER BY dateAdded DESC
    LIMIT 5
  `);
}

// Retrieve dashboard statistics
export async function getDashboardStats() {
  const documents = await db.getFirstAsync(
    'SELECT COUNT(*) AS total FROM documents'
  );

  const categories = await db.getFirstAsync(
    'SELECT COUNT(*) AS total FROM categories'
  );

  const storage = await db.getFirstAsync(
    'SELECT COALESCE(SUM(fileSize), 0) AS total FROM documents'
  );

  return {
    totalDocuments: documents.total,
    totalCategories: categories.total,
    totalStorage: storage.total,
  };
}

// CREATE: Add a new document
export async function addDocument(
  name,
  description,
  fileType,
  fileSize,
  categoryId,
  fileUri
) {
  const result = await db.runAsync(
    `INSERT INTO documents
    (name, description, fileType, fileSize, categoryId, dateAdded, fileUri)
    VALUES (?, ?, ?, ?, ?, ?, ?)`,
    [
      name.trim(),
      description?.trim() || '',
      fileType,
      fileSize || 0,
      categoryId || null,
      new Date().toISOString(),
      fileUri
    ]
  );

  return result;
}
