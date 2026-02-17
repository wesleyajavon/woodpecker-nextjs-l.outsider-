import nodemailer from 'nodemailer'

interface DownloadLink {
  beatTitle: string
  masterUrl: string
  hasStems?: boolean
  stemsUrl?: string
}

interface OrderEmailData {
  customerEmail: string
  customerName?: string
  orderId: string
  totalAmount: number
  currency: string
  isMultiItem: boolean
  beats: DownloadLink[]
  expiresAt: string
}

class EmailService {
  private transporter: nodemailer.Transporter

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: process.env.EMAIL_SERVER_HOST,
      port: Number(process.env.EMAIL_SERVER_PORT),
      secure: false,
      auth: {
        user: process.env.EMAIL_SERVER_USER,
        pass: process.env.EMAIL_SERVER_PASSWORD,
      },
    })
  }

  async sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
    try {
      const { customerEmail, orderId } = data

      const subject = `🎵 l.outsider - Votre commande #${orderId} est prête !`
      
      const html = this.generateOrderEmailHTML(data)
      const text = this.generateOrderEmailText(data)

      const ccEmail = process.env.ORDER_NOTIFICATION_CC ?? 'contact.loutsider@gmail.com'
      const mailOptions: nodemailer.SendMailOptions = {
        from: process.env.EMAIL_FROM || process.env.EMAIL_SERVER_USER,
        to: customerEmail,
        ...(ccEmail && { cc: ccEmail }),
        subject,
        html,
        text,
      }

      await this.transporter.sendMail(mailOptions)
      console.log(`✅ Order confirmation email sent to ${customerEmail} for order ${orderId}`)
    } catch (error) {
      console.error('❌ Error sending order confirmation email:', error)
      throw error
    }
  }

  private generateOrderEmailHTML(data: OrderEmailData): string {
    const { customerName, orderId, totalAmount, currency, isMultiItem, beats, expiresAt } = data
    
    const customerGreeting = customerName ? `Bonjour ${customerName},` : 'Bonjour,'
    const beatsCount = beats.length
    const beatsText = isMultiItem ? `${beatsCount} beats` : 'votre beat'

    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #0a0a0a; color: #ffffff;">
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #8b5cf6 0%, #ec4899 100%); padding: 30px; text-align: center;">
          <h1 style="margin: 0; color: white; font-size: 28px; font-weight: bold;">
            🎵 l.outsider
          </h1>
          <p style="margin: 10px 0 0 0; color: rgba(255,255,255,0.9); font-size: 16px;">
            Votre musique, votre style
          </p>
        </div>

        <!-- Content -->
        <div style="padding: 30px; background: #1a1a1a;">
          <h2 style="color: #8b5cf6; margin-top: 0; font-size: 24px;">
            🎉 Commande confirmée !
          </h2>
          
          <p style="font-size: 16px; line-height: 1.6; color: #e5e5e5;">
            ${customerGreeting}
          </p>
          
          <p style="font-size: 16px; line-height: 1.6; color: #e5e5e5;">
            Merci pour votre achat ! ${beatsText} ${isMultiItem ? 'sont' : 'est'} maintenant disponible au téléchargement.
          </p>

          <!-- Order Details -->
          <div style="background: #2a2a2a; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #8b5cf6;">
            <h3 style="color: #ffffff; margin-top: 0; font-size: 18px;">Détails de la commande</h3>
            <p style="margin: 5px 0; color: #a0a0a0;"><strong>ID de commande:</strong> <span style="color: #ffffff; font-family: monospace;">${orderId}</span></p>
            <p style="margin: 5px 0; color: #a0a0a0;"><strong>Montant total:</strong> <span style="color: #8b5cf6; font-weight: bold;">${totalAmount.toFixed(2)} ${currency}</span></p>
            <p style="margin: 5px 0; color: #a0a0a0;"><strong>Statut:</strong> <span style="color: #10b981; font-weight: bold;">✅ Payé</span></p>
          </div>

          <!-- Download Links -->
          <div style="background: #1e293b; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #60a5fa; margin-top: 0; font-size: 18px;">🔗 Liens de téléchargement</h3>
            <p style="color: #94a3b8; font-size: 14px; margin-bottom: 20px;">
              ⚠️ <strong>Important:</strong> Ces liens expirent dans 30 minutes. Téléchargez vos fichiers rapidement !
            </p>
            
            ${beats.map((beat, index) => `
              <div style="background: #334155; padding: 15px; border-radius: 6px; margin: 15px 0; border-left: 3px solid #60a5fa;">
                <h4 style="color: #ffffff; margin: 0 0 10px 0; font-size: 16px;">
                  ${index + 1}. ${beat.beatTitle}
                </h4>
                <a href="${beat.masterUrl}" 
                   style="display: inline-block; background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px 5px 5px 0;">
                  📥 Télécharger le master (WAV)
                </a>
                ${beat.hasStems ? `
                  <a href="${beat.stemsUrl}" 
                     style="display: inline-block; background: #8b5cf6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 6px; font-weight: bold; margin: 5px 5px 5px 0;">
                    🎛️ Télécharger les stems
                  </a>
                ` : ''}
              </div>
            `).join('')}
            
            <div style="background: #fbbf24; color: #92400e; padding: 15px; border-radius: 6px; margin-top: 20px; text-align: center;">
              <p style="margin: 0; font-weight: bold;">
                ⏰ Expire le ${new Date(expiresAt).toLocaleString('fr-FR')}
              </p>
            </div>
          </div>

          <!-- License Info -->
          <div style="background: #374151; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3 style="color: #f59e0b; margin-top: 0; font-size: 18px;">📋 Informations de licence</h3>
            <ul style="color: #d1d5db; padding-left: 20px;">
              <li>Usage commercial autorisé</li>
              <li>Droits de streaming inclus</li>
              <li>Distribution limitée selon le type de licence</li>
              <li>Crédit "Prod. l.outsider" requis</li>
            </ul>
          </div>

          <!-- Action Buttons -->
          <div style="text-align: center; margin: 30px 0;">
            <a href="${process.env.NEXTAUTH_URL}/beats" 
               style="display: inline-block; background: #8b5cf6; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
              🎵 Découvrir d'autres beats
            </a>
            <a href="${process.env.NEXTAUTH_URL}/profile" 
               style="display: inline-block; background: #374151; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 5px;">
              👤 Mon profil
            </a>
          </div>
        </div>

        <!-- Footer -->
        <div style="background: #111827; padding: 20px; text-align: center; border-top: 1px solid #374151;">
          <p style="color: #9ca3af; font-size: 14px; margin: 0;">
            Merci de faire confiance à l.outsider pour votre musique !<br>
            <a href="${process.env.NEXTAUTH_URL}" style="color: #8b5cf6;">loutsider.com</a>
          </p>
        </div>
      </div>
    `
  }

  private generateOrderEmailText(data: OrderEmailData): string {
    const { customerName, orderId, totalAmount, currency, isMultiItem, beats, expiresAt } = data
    
    const customerGreeting = customerName ? `Bonjour ${customerName},` : 'Bonjour,'
    const beatsCount = beats.length
    const beatsText = isMultiItem ? `${beatsCount} beats` : 'votre beat'

    return `
🎵 L.OUTSIDER - Commande confirmée !

${customerGreeting}

Merci pour votre achat ! ${beatsText} ${isMultiItem ? 'sont' : 'est'} maintenant disponible au téléchargement.

DÉTAILS DE LA COMMANDE:
- ID de commande: ${orderId}
- Montant total: ${totalAmount.toFixed(2)} ${currency}
- Statut: ✅ Payé

LIENS DE TÉLÉCHARGEMENT:
⚠️ IMPORTANT: Ces liens expirent dans 30 minutes !

${beats.map((beat, index) => `
${index + 1}. ${beat.beatTitle}
   📥 Master (WAV): ${beat.masterUrl}
   ${beat.hasStems ? `🎛️ Stems: ${beat.stemsUrl}` : ''}
`).join('')}

⏰ Expire le: ${new Date(expiresAt).toLocaleString('fr-FR')}

INFORMATIONS DE LICENCE:
- Usage commercial autorisé
- Droits de streaming inclus
- Distribution limitée selon le type de licence
- Crédit "Prod. l.outsider" requis

LIENS UTILES:
- Découvrir d'autres beats: ${process.env.NEXTAUTH_URL}/beats
- Mon profil: ${process.env.NEXTAUTH_URL}/profile

Merci de faire confiance à l.outsider pour votre musique !
${process.env.NEXTAUTH_URL}
    `.trim()
  }
}

export const emailService = new EmailService()
