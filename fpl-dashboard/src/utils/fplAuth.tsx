export const fetchFplIdThroughPopup = async (): Promise<number> => {
    return new Promise((resolve, reject) => {
        const width = 500;
        const height = 600;
        const left = window.screen.width / 2 - width / 2;
        const top = window.screen.height / 2 - height / 2;

        const popup = window.open(
            'https://fantasy.premierleague.com/api/me',
            'fplAuth',
            `width=${width},height=${height},top=${top},left=${left}`
        );

        const messageHandler = (event: MessageEvent) => {
            if (event.origin !== 'https://fantasy.premierleague.com') return;

            if (event.data?.entry) {
                resolve(event.data.entry);
                window.removeEventListener('message', messageHandler);
                popup?.close();
            }
        };

        window.addEventListener('message', messageHandler);

        // Fallback for if popup is blocked
        const timer = setInterval(() => {
            if (!popup || popup.closed) {
                clearInterval(timer);
                reject(new Error('Popup was closed'));
            }
        }, 500);
    });
};