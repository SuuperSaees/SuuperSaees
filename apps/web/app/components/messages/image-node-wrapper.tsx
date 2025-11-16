import { useEffect } from 'react';
import { useRef } from 'react';

import { Editor, NodeViewWrapper } from '@tiptap/react';

import styles from './styles.module.css';

interface GroupedImageNodeViewProps {
  node: {
    attrs: {
      src: string;
      alt?: string;
      [key: string]: unknown;
    };
  };
  editor: Editor;
  cleanupFunction?: () => void; // Optional cleanup function
}

const GroupedImageNodeView = ({ node, editor }: GroupedImageNodeViewProps) => {
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!wrapperRef.current) return;

    const originalImage = wrapperRef.current.querySelector('img');

    if (originalImage && originalImage.dataset.cloned === 'true') {
      return;
    }

    // Clone the image and mark it as cloned
    const clonedImage = originalImage?.cloneNode(true) as HTMLElement;
    clonedImage.style.visibility = 'visible';
    clonedImage.style.position = 'static';
    clonedImage.removeAttribute('data-cloned');
    clonedImage.classList.add('cloned-img');

    // Assign a unique ID to the cloned image
    const imageId = `img-${crypto.randomUUID()}`;
    clonedImage.id = imageId;

    // Create a wrapper div to hold the image and delete button
    const imageWrapper = document.createElement('div');
    imageWrapper.classList.add('relative', 'cloned-image-wrapper');

    // Move the cloned image into the wrapper
    imageWrapper.appendChild(clonedImage);

    // Create the delete button
    const deleteButton = document.createElement('button');
    deleteButton.classList.add(
      'absolute',
      'right-2',
      'top-1',
      'cursor-pointer',
      'text-white/80',
      'hover:text-white/100',
    );

    // Add the "X" icon inside the delete button
    deleteButton.innerHTML = '<span>X</span>';

    // Attach the delete function to the button
    deleteButton.addEventListener('click', () => {
      imageWrapper.remove();
    });

    // Append the delete button to the image wrapper
    imageWrapper.appendChild(deleteButton);

    // Mark the original image to prevent further cloning
    if (originalImage) {
      originalImage.style.visibility = 'hidden';
      originalImage.style.position = 'absolute';
      originalImage.dataset.cloned = 'true';
    }

    let parentDiv = document.querySelector('.image-group');

    if (!parentDiv) {
      // If no group exists, create a new one
      parentDiv = document.createElement('div');
      parentDiv.classList.add('image-group', `${styles['image-group']}`);
      editor.view.dom.appendChild(parentDiv);
    }

    // Append the image wrapper (with the image and delete button) to the group
    parentDiv.appendChild(imageWrapper);

    // Clean up the DOM when the component unmounts
    // return () => {
    //   if (imageWrapper) {
    //     imageWrapper.remove();
    //   }
    // };
  }, [editor]);

  /* eslint-disable @next/next/no-img-element */
  return (
    <NodeViewWrapper ref={wrapperRef} as="div" className="relative">
      <img {...node?.attrs} className="cloned-image" />
    </NodeViewWrapper>
  );
};

export default GroupedImageNodeView;
