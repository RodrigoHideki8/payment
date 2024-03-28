import * as PixUtils from 'pix-utils';
import { CreateStaticPixParams } from 'pix-utils/dist/main/types/pixCreate';

export class SantanderUtils {
  /**
   * Generates a new random hash based on txId pattern [a-zA-Z0-9]{15,25}
   * @returns generatedTxId
   */
  public static generateTxId(): string {
    const chars =
      'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    const hashLength = 32;

    let hash = '';
    for (let i = 0; i < hashLength; i++) {
      const randomIndex = Math.floor(Math.random() * chars.length);
      hash += chars.charAt(randomIndex);
    }

    return hash;
  }

  public static generatePixQrCode(input: CreateStaticPixParams) {
    const pix = PixUtils.createStaticPix(input);

    if (!PixUtils.hasError(pix)) {
      const brCode = pix.toBRCode();
      return brCode;
    }
  }

  public static readPix(input: string) {
    return PixUtils.parsePix(input);
  }
}
