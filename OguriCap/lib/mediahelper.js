export const BASE_URL = 'https://raw.githubusercontent.com/asahichanID/Umaimage/main/uma';

export const getUiThumbnail = (name) => `${BASE_URL}/Thumbnail/${name}.png`;

export const getPlayThumb = () => getUiThumbnail('play_thumb');
export const getYtmp4Thumb = () => getUiThumbnail('ytmp4_thumb');
export const getOguriThumb = () => getUiThumbnail('oguri_thumb');

export const getBannerImage = () => null;
export const getLimitedImage = () => null;
export const getCharacterImage = () => null;
