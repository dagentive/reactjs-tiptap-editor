import { useMemo, useRef, useState } from 'react';

import { ActionButton, Button, Checkbox, Input, Label, Tabs, TabsContent, TabsList, TabsTrigger } from '@/components';
import { Dialog, DialogContent, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ImageCropper } from '@/extensions/Image/components/ImageCropper';
import Image from '@/extensions/Image/Image';
import { actionDialogImage, useDialogImage } from '@/extensions/Image/store';
import { useLocale } from '@/locales';

function ActionImageButton(props: any) {
  const { t } = useLocale();

  const dialogImage = useDialogImage();

  const [link, setLink] = useState<string>('');
  const fileInput = useRef<HTMLInputElement>(null);

  const [imageInline, setImageInline] = useState(props.editor.extensionManager.extensions.find(
    (extension: any) => extension.name === Image.name,
  )?.options.defaultInline || false);

  const uploadOptions = useMemo(() => {
    const uploadOptions = props.editor.extensionManager.extensions.find(
      (extension: any) => extension.name === Image.name,
    )?.options;

    return uploadOptions;
  }, [props.editor]);

  async function handleFile(event: any) {
    const files = event?.target?.files;
    if (!props.editor || props.editor.isDestroyed || files.length === 0) {
      return;
    }

    const file = files[0];

    let src = '';
    if (uploadOptions.upload) {
      src = await uploadOptions.upload(file);
    } else {
      src = URL.createObjectURL(file);
    }

    props.editor.chain().focus().setImageInline({ src, inline: imageInline }).run();
    actionDialogImage.setOpen(false);
    setImageInline(false);
  }
  function handleLink(e: any) {
    e.preventDefault();
    e.stopPropagation();

    props.editor.chain().focus().setImageInline({ src: link, inline: imageInline }).run();
    actionDialogImage.setOpen(false);
    setImageInline(false);
    setLink('');
  }

  function handleClick(e: any) {
    e.preventDefault();
    fileInput.current?.click();
  }

  return (
    <Dialog onOpenChange={actionDialogImage.setOpen}
      open={dialogImage}
    >
      <DialogTrigger asChild>
        <ActionButton
          action={() => actionDialogImage.setOpen(true)}
          icon={props.icon}
          tooltip={props.tooltip}
        />
      </DialogTrigger>

      <DialogContent>
        <DialogTitle>
          {t('editor.image.dialog.title')}
        </DialogTitle>

        <Tabs
          activationMode="manual"
          defaultValue={
            uploadOptions.resourceImage === 'both' || uploadOptions.resourceImage === 'upload'
              ? 'upload'
              : 'link'
          }
        >
          <TabsList className="richtext-grid richtext-w-full richtext-grid-cols-2">
            {uploadOptions.resourceImage === 'both' || uploadOptions.resourceImage === 'upload'
              ? (
                <TabsTrigger value="upload">
                  {t('editor.image.dialog.tab.upload')}
                </TabsTrigger>
              )
              : <></>}

            {uploadOptions.resourceImage === 'both' || uploadOptions.resourceImage === 'link'
              ? (
                <TabsTrigger value="link">
                  {t('editor.image.dialog.tab.url')}
                </TabsTrigger>
              )
              : <></>}
          </TabsList>

          <div className="richtext-my-[10px] richtext-flex richtext-items-center richtext-gap-[4px]">
            <Checkbox
              checked={imageInline}
              onCheckedChange={(v) => {
                setImageInline(v as boolean);
              }}
            />

            <Label>
              {t('editor.link.dialog.inline')}
            </Label>
          </div>

          <TabsContent value="upload">
            <div className="richtext-flex richtext-items-center richtext-gap-[10px]">
              <Button className="richtext-mt-1 richtext-w-full"
                onClick={handleClick}
                size="sm"
              >
                {t('editor.image.dialog.tab.upload')}
              </Button>

              <ImageCropper
                editor={props.editor}
                imageInline={imageInline}
                onClose={() => actionDialogImage.setOpen(false)}
              />
            </div>

            <input
              accept="image/*"
              multiple
              onChange={handleFile}
              ref={fileInput}
              type="file"
              style={{
                display: 'none',
              }}
            />
          </TabsContent>

          <TabsContent value="link">
            <form onSubmit={handleLink}>
              <div className="richtext-flex richtext-items-center richtext-gap-2">
                <Input
                  autoFocus
                  onChange={e => setLink(e.target.value)}
                  placeholder={t('editor.image.dialog.placeholder')}
                  required
                  type="url"
                  value={link}
                />

                <Button type="submit">
                  {t('editor.image.dialog.button.apply')}
                </Button>
              </div>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

export default ActionImageButton;
