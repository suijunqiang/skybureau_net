// Test file to verify image URL extraction functionality
// This simulates the blog picture profile data structure with priority logic

import { BASE_URL } from '../../api/api.js';

const testBlogData = {
  "id": 1,
  "b_title": "Test Blog",
  "b_first_pic": "http://example.com/current-profile.jpg", // Current Profile Picture
  "b_blog_picture_profile": {
    "id": 3,
    "documentId": "vfpr6dwr5dzlrj84y5nyffwm",
    "name": "Yaw.png",
    "previewURL": null, // When previewURL is null, use url field
    "url": "/uploads/original_Yaw_fcdefae0da.png",
    "alternativeText": null,
    "caption": null,
    "width": 714,
    "height": 562,
    "formats": {
      "small": {
        "ext": ".png",
        "url": "/uploads/small_Yaw_fcdefae0da.png",
        "hash": "small_Yaw_fcdefae0da",
        "mime": "image/png",
        "name": "small_Yaw.png",
        "path": null,
        "size": 49.9,
        "width": 500,
        "height": 394,
        "sizeInBytes": 49899
      },
      "thumbnail": {
        "ext": ".png",
        "url": "/uploads/thumbnail_Yaw_fcdefae0da.png",
        "hash": "thumbnail_Yaw_fcdefae0da",
        "mime": "image/png",
        "name": "thumbnail_Yaw.png",
        "path": null,
        "size": 13.33,
        "width": 198,
        "height": 156,
        "sizeInBytes": 13331
      }
    }
  }
};

const testBlogDataNoCurrent = {
  "id": 2,
  "b_title": "Test Blog No Current",
  "b_first_pic": "", // Empty Current Profile Picture
  "b_blog_picture_profile": {
    "id": 3,
    "previewURL": "/uploads/preview_Yaw_fcdefae0da.png", // Has previewURL, use it
    "url": "/uploads/original_Yaw_fcdefae0da.png",
    "formats": {
      "small": {
        "url": "/uploads/small_Yaw_fcdefae0da.png"
      },
      "thumbnail": {
        "url": "/uploads/thumbnail_Yaw_fcdefae0da.png"
      }
    }
  }
};

const testBlogDataFirstPicNull = {
  "id": 4,
  "b_title": "Test Blog with b_first_pic null",
  "b_first_pic": null, // Explicitly null - should use url field from b_blog_picture_profile
  "b_blog_picture_profile": {
    "id": 5,
    "previewURL": "/uploads/preview_some_image.png",
    "url": "/uploads/direct_fallback_image.png", // Should use this when b_first_pic is null
    "formats": {
      "small": {
        "url": "/uploads/small_fallback.png"
      }
    }
  }
};

const testBlogDataPreviewNull = {
  "id": 3,
  "b_title": "Test Blog Preview Null",
  "b_first_pic": "", // Empty Current Profile Picture
  "b_blog_picture_profile": {
    "id": 4,
    "previewURL": null, // previewURL is null, should use url field
    "url": "/uploads/direct_image.png",
    "formats": {
      "small": {
        "url": "/uploads/small_image.png"
      }
    }
  }
};

// Utility function with priority logic (same as in components) - Corrected field handling
const getImageUrl = (blog, format = 'thumbnail') => {
  if (!blog) return null;
  
  // 1. 优先尝试Current Profile Picture (b_first_pic)，但如果为null则跳过
  if (blog.b_first_pic !== null && blog.b_first_pic && blog.b_first_pic.trim() !== '') {
    // 如果是完整URL，直接返回
    if (blog.b_first_pic.startsWith('http')) {
      return blog.b_first_pic;
    }
    // 如果是相对路径，拼接base URL
    return `${BASE_URL}${blog.b_first_pic}`;
  }
  
  // 2. 如果b_first_pic为null或空，使用b_blog_picture_profile中的url字段
  const blogPictureProfile = blog.b_blog_picture_profile;
  if (!blogPictureProfile) return null;
  
  // 关键修正：当b_first_pic为null时，直接使用url字段显示图片
  if (blogPictureProfile.url) {
    return `${BASE_URL}${blogPictureProfile.url}`;
  }
  
  // 备用：如果url字段也没有，尝试使用previewURL
  if (blogPictureProfile.previewURL && blogPictureProfile.previewURL !== null) {
    return `${BASE_URL}${blogPictureProfile.previewURL}`;
  }
  
  // 如果有指定格式的图片，使用它
  if (blogPictureProfile.formats && blogPictureProfile.formats[format]) {
    return `${BASE_URL}${blogPictureProfile.formats[format].url}`;
  }
  
  // 如果没有指定格式，尝试使用小尺寸图片
  if (blogPictureProfile.formats && blogPictureProfile.formats.small) {
    return `${BASE_URL}${blogPictureProfile.formats.small.url}`;
  }
  
  // 如果没有小尺寸图片，尝试使用缩略图
  if (blogPictureProfile.formats && blogPictureProfile.formats.thumbnail) {
    return `${BASE_URL}${blogPictureProfile.formats.thumbnail.url}`;
  }
  
  return null;
};

// Test cases
console.log("Testing image URL extraction with corrected field handling:");
console.log("1. Blog with Current Profile Picture:", getImageUrl(testBlogData, 'thumbnail'));
console.log("2. Blog with Current Profile Picture (small):", getImageUrl(testBlogData, 'small'));
console.log("3. Blog without Current Profile Picture (has previewURL):", getImageUrl(testBlogDataNoCurrent, 'thumbnail'));
console.log("4. Blog with b_first_pic=null (should use url field):", getImageUrl(testBlogDataFirstPicNull, 'thumbnail'));
console.log("5. Blog with previewURL=null (should use url field):", getImageUrl(testBlogDataPreviewNull, 'thumbnail'));
console.log("6. Null input:", getImageUrl(null));
console.log("7. Empty object:", getImageUrl({}));

// Expected outputs:
// 1. http://example.com/current-profile.jpg (uses b_first_pic)
// 2. http://example.com/current-profile.jpg (uses b_first_pic)
// 3. ${BASE_URL}/uploads/preview_Yaw_fcdefae0da.png (uses previewURL)
// 4. ${BASE_URL}/uploads/direct_fallback_image.png (uses url field when b_first_pic is null)
// 5. ${BASE_URL}/uploads/direct_image.png (uses url field when previewURL is null)
// 6. null
// 7. null

export default {
  testBlogData,
  testBlogDataNoCurrent,
  testBlogDataFirstPicNull,
  testBlogDataPreviewNull,
  getImageUrl
};