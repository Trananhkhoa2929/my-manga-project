/**
 * Storage Module Exports
 */

// R2 Storage
export {
    uploadToR2,
    deleteFromR2,
    existsInR2,
    getPublicUrl,
    generatePageKey,
    generateCoverKey,
    generateBannerKey,
} from './r2';

// Image Optimizer
export {
    optimizeForMobile,
    optimizeForDesktop,
    createThumbnail,
    optimizeCover,
    optimizeBanner,
    getImageMetadata,
    autoOptimize,
} from './image-optimizer';
