import { useToggle } from './useToggle';

export function useBoolToggle(initialValue = false) {
    return useToggle(initialValue, [true, false]);
}