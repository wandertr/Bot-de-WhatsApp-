const { Client, LocalAuth, MessageMedia } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const { Sticker, StickerTypes } = require('wa-sticker-formatter');

const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        args: ['--no-sandbox', '--disable-setuid-sandbox']
    }
});

client.on('qr', (qr) => {
    console.log('Escanea este código QR con tu WhatsApp:');
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('¡El bot está listo!');
});

client.on('message', async (msg) => {
    // Comprobar si el mensaje es una imagen, video o gif y si contiene el comando !sticker
    if ((msg.type === 'image' || msg.type === 'video' || msg.type === 'gif') && msg.body.toLowerCase().includes('!sticker')) {
        try {
            console.log(`Procesando sticker para: ${msg.from}`);
            
            const media = await msg.downloadMedia();
            
            if (!media) {
                return msg.reply('No se pudo descargar el archivo. Inténtalo de nuevo.');
            }

            const sticker = new Sticker(media.data, {
                pack: 'Mi Bot de Stickers', // Nombre del paquete
                author: 'Manus Bot',        // Autor
                type: StickerTypes.FULL,    // Tipo de sticker
                categories: ['🤩', '🎉'],   // Categorías
                quality: 70,                // Calidad
            });

            const stickerBuffer = await sticker.toBuffer();
            const stickerMedia = new MessageMedia('image/webp', stickerBuffer.toString('base64'), 'sticker.webp');
            
            await client.sendMessage(msg.from, stickerMedia, { sendMediaAsSticker: true });
            console.log('Sticker enviado con éxito.');

        } catch (error) {
            console.error('Error al crear el sticker:', error);
            msg.reply('Ocurrió un error al procesar tu sticker. Asegúrate de que el video no sea muy largo.');
        }
    }
    
    // Responder a un mensaje citado con !sticker
    if (msg.hasQuotedMsg && msg.body.toLowerCase() === '!sticker') {
        const quotedMsg = await msg.getQuotedMessage();
        
        if (quotedMsg.type === 'image' || quotedMsg.type === 'video' || quotedMsg.type === 'gif') {
            try {
                console.log(`Procesando sticker citado para: ${msg.from}`);
                const media = await quotedMsg.downloadMedia();
                
                if (!media) {
                    return msg.reply('No se pudo descargar el archivo citado.');
                }

                const sticker = new Sticker(media.data, {
                    pack: 'Mi Bot de Stickers',
                    author: 'Manus Bot',
                    type: StickerTypes.FULL,
                    quality: 70,
                });

                const stickerBuffer = await sticker.toBuffer();
                const stickerMedia = new MessageMedia('image/webp', stickerBuffer.toString('base64'), 'sticker.webp');
                
                await client.sendMessage(msg.from, stickerMedia, { sendMediaAsSticker: true });
                console.log('Sticker citado enviado con éxito.');

            } catch (error) {
                console.error('Error al crear el sticker citado:', error);
                msg.reply('Error al procesar el mensaje citado.');
            }
        }
    }
});

client.initialize();
