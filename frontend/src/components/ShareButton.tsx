import React, { useState } from 'react';
import './ShareButton.css';

interface ShareButtonProps {
  roomId: string;
  roomName: string;
  accessCode?: string;
}

const ShareButton: React.FC<ShareButtonProps> = ({ roomId, roomName, accessCode }) => {
  const [copied, setCopied] = useState(false);
  const [showShareMenu, setShowShareMenu] = useState(false);

  const roomUrl = accessCode 
    ? `${window.location.origin}/room/${roomId}?code=${accessCode}`
    : `${window.location.origin}/room/${roomId}`;

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(roomUrl);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for mobile devices
      const textArea = document.createElement('textarea');
      textArea.value = roomUrl;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join Planning Poker: ${roomName}`,
          text: `Join my Planning Poker session: ${roomName}${accessCode ? `\nAccess Code: ${accessCode}` : ''}`,
          url: roomUrl,
        });
      } catch (err) {
        if ((err as Error).name !== 'AbortError') {
          handleCopyLink();
        }
      }
    } else {
      setShowShareMenu(!showShareMenu);
    }
  };

  const handleWhatsApp = () => {
    const text = encodeURIComponent(`Join my Planning Poker session: ${roomName}${accessCode ? `\nAccess Code: ${accessCode}` : ''}\n${roomUrl}`);
    window.open(`https://wa.me/?text=${text}`, '_blank');
  };

  const handleEmail = () => {
    const subject = encodeURIComponent(`Join Planning Poker: ${roomName}`);
    const body = encodeURIComponent(`Join my Planning Poker session:\n\nRoom: ${roomName}${accessCode ? `\nAccess Code: ${accessCode}` : ''}\nLink: ${roomUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="share-button-container">
      <button className="share-button" onClick={handleShare}>
        <svg className="share-icon" viewBox="0 0 24 24" width="20" height="20">
          <path fill="currentColor" d="M18 16.08c-.76 0-1.44.3-1.96.77L8.91 12.7c.05-.23.09-.46.09-.7s-.04-.47-.09-.7l7.05-4.11c.54.5 1.25.81 2.04.81 1.66 0 3-1.34 3-3s-1.34-3-3-3-3 1.34-3 3c0 .24.04.47.09.7L8.04 9.81C7.5 9.31 6.79 9 6 9c-1.66 0-3 1.34-3 3s1.34 3 3 3c.79 0 1.5-.31 2.04-.81l7.12 4.16c-.05.21-.08.43-.08.65 0 1.61 1.31 2.92 2.92 2.92 1.61 0 2.92-1.31 2.92-2.92s-1.31-2.92-2.92-2.92z"/>
        </svg>
        Share
      </button>

      {showShareMenu && (
        <div className="share-menu">
          <button className="share-option" onClick={handleCopyLink}>
            <svg className="option-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M16 1H4c-1.1 0-2 .9-2 2v14h2V3h12V1zm3 4H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h11c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h11v14z"/>
            </svg>
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
          <button className="share-option" onClick={handleWhatsApp}>
            <svg className="option-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.149-.67.149-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414-.074-.123-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
            </svg>
            WhatsApp
          </button>
          <button className="share-option" onClick={handleEmail}>
            <svg className="option-icon" viewBox="0 0 24 24" width="18" height="18">
              <path fill="currentColor" d="M20 4H4c-1.1 0-1.99.9-1.99 2L2 18c0 1.1.9 2 2 2h16c1.1 0 2-.9 2-2V6c0-1.1-.9-2-2-2zm0 4l-8 5-8-5V6l8 5 8-5v2z"/>
            </svg>
            Email
          </button>
        </div>
      )}

      {copied && <div className="copy-toast">Link copied to clipboard!</div>}
    </div>
  );
};

export default ShareButton;