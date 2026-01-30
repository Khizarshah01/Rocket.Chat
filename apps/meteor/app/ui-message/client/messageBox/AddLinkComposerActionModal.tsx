import { Field, FieldGroup, TextInput, FieldLabel, FieldRow, Box } from '@rocket.chat/fuselage';
import { GenericModal } from '@rocket.chat/ui-client';
import { useEffect, useId } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { useTranslation } from 'react-i18next';

type AddLinkComposerActionModalProps = {
	selectedText?: string;
	onConfirm: (url: string, text: string) => void;
	onClose: () => void;
};

const AddLinkComposerActionModal = ({ selectedText, onClose, onConfirm }: AddLinkComposerActionModalProps) => {
	const { t } = useTranslation();
	const textField = useId();
	const urlField = useId();

	const { handleSubmit, setFocus, control, formState: { isValid } } = useForm({
		mode: 'onChange',
		defaultValues: {
			text: selectedText || '',
			url: '',
		},
	});

	useEffect(() => {
		setFocus(selectedText ? 'url' : 'text');
	}, [selectedText, setFocus]);

	const onClickConfirm = ({ url, text }: { url: string; text: string }) => {
		onConfirm(url, text);
	};

	const submit = handleSubmit(onClickConfirm);

	return (
		<GenericModal
			variant='warning'
			icon={null}
			confirmText={t('Add')}
			confirmDisabled={!isValid}
			onCancel={onClose}
			wrapperFunction={(props) => <Box is='form' onSubmit={(e) => void submit(e)} {...props} />}
			title={t('Add_link')}
		>
			<FieldGroup>
				<Field>
					<FieldLabel htmlFor={textField}>{t('Text')}</FieldLabel>
					<FieldRow>
						<Controller control={control} name='text' render={({ field }) => <TextInput autoComplete='off' id={textField} {...field} />} />
					</FieldRow>
				</Field>
				<Field>
					<FieldLabel htmlFor={urlField}>{t('URL')}</FieldLabel>
					<FieldRow>
						<Controller control={control} name='url' rules={{ validate: isValidUrl }} render={({ field }) => <TextInput autoComplete='off' id={urlField} {...field} />} />
					</FieldRow>
				</Field>
			</FieldGroup>
		</GenericModal>
	);
};

const isValidUrl = (value: string): boolean => {
	const url = value.trim();

	if (!url) {
		return false;
	}

	if (/^(javascript|data|vbscript):/i.test(url)) {
		return false;
	}

	try {
		new URL(/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(url) ? url : `//${url}`);
		return true;
	} catch {
		return false;
	}
};

export default AddLinkComposerActionModal;
