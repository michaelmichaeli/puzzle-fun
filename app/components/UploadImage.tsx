import React from "react";

interface UploadImageProps {
	handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadImage: React.FC<UploadImageProps> = (
	uploadImageProps: UploadImageProps
) => {
	const { handleImageChange } = uploadImageProps;

	return (
		<div className="border-2 border-dashed border-gray-300 p-4 rounded-md">
			<label className="flex flex-col items-center justify-center space-y-3 cursor-pointer">
				<svg
					xmlns="http://www.w3.org/2000/svg"
					className="w-12 h-12 text-gray-400"
					fill="none"
					viewBox="0 0 24 24"
					stroke="currentColor"
					strokeWidth="2"
				>
					<path
						strokeLinecap="round"
						strokeLinejoin="round"
						d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v6"
					/>
				</svg>
				<p className="text-sm text-gray-600">
					<span className="font-semibold">Click to upload</span> or drag and
					drop
				</p>
				<input
					type="file"
					accept="image/*"
					className="hidden"
					onChange={handleImageChange}
				/>
			</label>
		</div>
	);
};

export default UploadImage;
