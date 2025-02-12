"use client";

import React, { useState } from "react";
import { LoadingSpinner } from "./LoadingSpinner";
interface UploadImageProps {
	handleImageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const UploadImage: React.FC<UploadImageProps> = ({ handleImageChange }) => {
	const [isDragging, setIsDragging] = useState(false);
	const [isProcessing, setIsProcessing] = useState(false);

	const handleDragEnter = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(true);
	};

	const handleDragLeave = (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
	};

	const handleDrop = async (e: React.DragEvent) => {
		e.preventDefault();
		setIsDragging(false);
		setIsProcessing(true);

		const file = e.dataTransfer.files[0];
		if (file) {
			const input = document.createElement("input");
			input.type = "file";
			const dataTransfer = new DataTransfer();
			dataTransfer.items.add(file);
			input.files = dataTransfer.files;

			const syntheticEvent = {
				target: input,
				currentTarget: input,
				preventDefault: () => {},
				stopPropagation: () => {},
				nativeEvent: new Event("change"),
				bubbles: true,
				cancelable: true,
				defaultPrevented: false,
				type: "change",
			} as React.ChangeEvent<HTMLInputElement>;

			await handleImageChange(syntheticEvent);
		}

		setIsProcessing(false);
	};

	const handleInputChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
		setIsProcessing(true);
		await handleImageChange(e);
		setIsProcessing(false);
	};

	return (
		<div
			className={`flex flex-col items-center justify-center p-8 border-2 border-dashed rounded-lg transition-all duration-300 ${
				isDragging
					? "border-blue-500 bg-blue-500/10"
					: "border-gray-700 bg-gray-800/50 hover:border-gray-600 hover:bg-gray-800/70"
			}`}
			onDragEnter={handleDragEnter}
			onDragOver={(e) => e.preventDefault()}
			onDragLeave={handleDragLeave}
			onDrop={handleDrop}
		>
			<label className="cursor-pointer group relative">
				<div
					className={`flex flex-col items-center gap-4 transition-opacity duration-300 ${
						isProcessing ? "opacity-50" : "opacity-100"
					}`}
				>
					<div className="p-4 rounded-full bg-gray-800 group-hover:bg-gray-700 transition-all duration-300 transform group-hover:scale-110">
						{isProcessing ? (
							<LoadingSpinner size="sm" />
						) : (
							<svg
								className="w-8 h-8 text-gray-400"
								fill="none"
								stroke="currentColor"
								viewBox="0 0 24 24"
							>
								<path
									strokeLinecap="round"
									strokeLinejoin="round"
									strokeWidth={2}
									d="M12 6v6m0 0v6m0-6h6m-6 0H6"
								/>
							</svg>
						)}
					</div>
					<div className="text-center space-y-2">
						<p className="text-gray-300">
							{isProcessing
								? "Processing image..."
								: isDragging
								? "Drop image here"
								: "Click or drag image to upload"}
						</p>
						<p className="text-sm text-gray-500">PNG, JPG up to 10MB</p>
					</div>
				</div>
				<input
					type="file"
					className="hidden"
					accept="image/*"
					onChange={handleInputChange}
					disabled={isProcessing}
				/>
			</label>
		</div>
	);
};

export default UploadImage;
