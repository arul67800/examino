import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();
    const file = formData.get('image') as File;
    const altText = formData.get('altText') as string;
    const description = formData.get('description') as string;

    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only JPEG, PNG, GIF, and WebP are allowed.' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024; // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File size too large. Maximum size is 10MB.' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Save the file to a storage service (AWS S3, Cloudinary, etc.)
    // 2. Generate thumbnails
    // 3. Save metadata to database
    // 4. Return the public URL

    // For now, we'll just return a mock response
    const mockImageId = `img-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const mockUrl = `https://via.placeholder.com/800x600/4ECDC4/FFFFFF?text=${encodeURIComponent(file.name)}`;

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 1000));

    return NextResponse.json({
      success: true,
      id: mockImageId,
      url: mockUrl,
      thumbnailUrl: `https://via.placeholder.com/150x150/4ECDC4/FFFFFF?text=thumb`,
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      altText: altText || '',
      description: description || '',
      uploadedAt: new Date().toISOString(),
      dimensions: {
        width: 800,
        height: 600
      }
    });

  } catch (error) {
    console.error('Upload error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');
    const search = searchParams.get('search') || '';
    const category = searchParams.get('category') || '';

    // Mock data for gallery
    const mockImages = [
      {
        id: 'mock-1',
        url: 'https://via.placeholder.com/800x600/FF6B6B/FFFFFF?text=Sample+1',
        thumbnailUrl: 'https://via.placeholder.com/150x150/FF6B6B/FFFFFF?text=1',
        fileName: 'sample1.jpg',
        fileSize: 245760,
        fileType: 'image/jpeg',
        altText: 'A sample placeholder image',
        description: 'Sample image 1',
        uploadedAt: new Date(Date.now() - 86400000).toISOString(),
        dimensions: { width: 800, height: 600 },
        tags: ['sample', 'placeholder'],
        category: 'photos'
      },
      {
        id: 'mock-2',
        url: 'https://via.placeholder.com/1200x800/4ECDC4/FFFFFF?text=Sample+2',
        thumbnailUrl: 'https://via.placeholder.com/150x150/4ECDC4/FFFFFF?text=2',
        fileName: 'sample2.jpg',
        fileSize: 189440,
        fileType: 'image/jpeg',
        altText: 'Another sample placeholder image',
        description: 'Sample image 2',
        uploadedAt: new Date(Date.now() - 172800000).toISOString(),
        dimensions: { width: 1200, height: 800 },
        tags: ['sample', 'landscape'],
        category: 'graphics'
      },
      {
        id: 'mock-3',
        url: 'https://via.placeholder.com/600x400/45B7D1/FFFFFF?text=Sample+3',
        thumbnailUrl: 'https://via.placeholder.com/150x150/45B7D1/FFFFFF?text=3',
        fileName: 'sample3.png',
        fileSize: 156723,
        fileType: 'image/png',
        altText: 'Third sample image',
        description: 'Sample image 3 with transparency',
        uploadedAt: new Date(Date.now() - 259200000).toISOString(),
        dimensions: { width: 600, height: 400 },
        tags: ['sample', 'blue'],
        category: 'icons'
      }
    ];

    // Filter by search term
    let filteredImages = mockImages;
    if (search) {
      filteredImages = mockImages.filter(img => 
        img.fileName.toLowerCase().includes(search.toLowerCase()) ||
        img.description.toLowerCase().includes(search.toLowerCase()) ||
        img.tags.some(tag => tag.toLowerCase().includes(search.toLowerCase()))
      );
    }

    // Filter by category
    if (category) {
      filteredImages = filteredImages.filter(img => img.category === category);
    }

    // Paginate
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedImages = filteredImages.slice(startIndex, endIndex);

    return NextResponse.json({
      images: paginatedImages,
      total: filteredImages.length,
      hasMore: endIndex < filteredImages.length,
      page,
      limit
    });

  } catch (error) {
    console.error('Gallery fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const imageId = searchParams.get('id');

    if (!imageId) {
      return NextResponse.json(
        { error: 'Image ID is required' },
        { status: 400 }
      );
    }

    // In a real application, you would:
    // 1. Delete the file from storage
    // 2. Remove from database
    // 3. Clean up thumbnails

    // Simulate processing delay
    await new Promise(resolve => setTimeout(resolve, 500));

    return NextResponse.json({
      success: true,
      message: 'Image deleted successfully'
    });

  } catch (error) {
    console.error('Delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}