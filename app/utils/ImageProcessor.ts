type ImageValidationResult = {
	isValid: boolean;
	error?: string;
};

type ProcessedImage = {
	dataUrl: string;
	width: number;
	height: number;
};

export class ImageProcessor {
	static readonly MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
	private static readonly MAX_DIMENSION = 4096;
	private static readonly TARGET_WIDTH = 800;
	private static readonly TARGET_HEIGHT = 600;
	private static readonly QUALITY = 0.9;

	static validateImage(file: File): ImageValidationResult {
		if (!file.type.startsWith("image/")) {
			return { isValid: false, error: "File must be an image" };
		}

		if (file.size > this.MAX_FILE_SIZE) {
			return { isValid: false, error: "Image size must be less than 5MB" };
		}

		return { isValid: true };
	}

	static async process(file: File): Promise<ProcessedImage> {
		const validation = this.validateImage(file);
		if (!validation.isValid) {
			throw new Error(validation.error);
		}

		const imageUrl = await this.readFileAsDataURL(file);
		const img = await this.loadImage(imageUrl);

		if (img.width > this.MAX_DIMENSION || img.height > this.MAX_DIMENSION) {
			throw new Error("Image dimensions are too large");
		}

		const result = await this.resizeImage(img);
		return result;
	}

	private static readFileAsDataURL(file: File): Promise<string> {
		return new Promise((resolve, reject) => {
			const reader = new FileReader();
			reader.onload = () => resolve(reader.result as string);
			reader.onerror = () => reject(new Error("Failed to read file"));
			reader.readAsDataURL(file);
		});
	}

	private static loadImage(url: string): Promise<HTMLImageElement> {
		return new Promise((resolve, reject) => {
			const img = new Image();
			img.onload = () => resolve(img);
			img.onerror = () => reject(new Error("Failed to load image"));
			img.src = url;
		});
	}

	private static resizeImage(img: HTMLImageElement): Promise<ProcessedImage> {
		return new Promise((resolve) => {
			const canvas = document.createElement("canvas");
			const ctx = canvas.getContext("2d");

			if (!ctx) {
				throw new Error("Canvas context not available");
			}

			let { width, height } = img;

			if (width > this.TARGET_WIDTH || height > this.TARGET_HEIGHT) {
				const widthRatio = this.TARGET_WIDTH / width;
				const heightRatio = this.TARGET_HEIGHT / height;
				const scale = Math.min(widthRatio, heightRatio);

				width = Math.floor(width * scale);
				height = Math.floor(height * scale);
			}

			canvas.width = width;
			canvas.height = height;

			ctx.drawImage(img, 0, 0, width, height);

			const dataUrl = canvas.toDataURL("image/jpeg", this.QUALITY);

			canvas.width = 0;
			canvas.height = 0;

			resolve({
				dataUrl,
				width,
				height,
			});
		});
	}
}
