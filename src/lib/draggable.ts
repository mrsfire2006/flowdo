import { draggable as atlaskitDraggable } from '@atlaskit/pragmatic-drag-and-drop/element/adapter';
import type { TaskCard } from './shared-types/task';

type Options = {
	getTask: () => TaskCard;
	onDragStart?: () => void;
	onDrop?: () => void;
};

export function draggable(node: HTMLElement, options: Options) {
	const handle = node.querySelector<HTMLElement>('[data-drag-handle]');

	const cleanup = atlaskitDraggable({
		element: node,

		dragHandle: handle ?? undefined,

		getInitialData: () => ({
			type: 'task',
			task: options.getTask()
		}),

		onDragStart() {
			node.style.visibility = 'hidden';

			options.onDragStart?.();
		},

		onDrop({ location }) {
			const target = location.current.dropTargets[0];
			const movedToOtherColumn = target && target.data.status !== options.getTask().status;

			if (!movedToOtherColumn) {
				node.style.visibility = '';
			}
			options.onDrop?.();
		}
	});

	return {
		destroy() {
			cleanup();
		}
	};
}
