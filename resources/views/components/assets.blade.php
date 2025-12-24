{{-- Importmap for ESM assets --}}
@php
    $esmAssets = array_filter($bundle->js, fn($js) => $js->type === \Mati365\CKEditor5Livewire\Cloud\Bundle\JSAssetType::ESM);
    $generatedImportMap = [];

    foreach ($esmAssets as $asset) {
        $generatedImportMap[$asset->name] = $asset->url;
    }

    $finalImportMap = array_merge($generatedImportMap, $importMap ?? []);
@endphp

@if($useImportMap && !empty($finalImportMap))
    <script type="importmap" @if($nonce) nonce="{{ $nonce }}" @endif>
    {
        "imports": {!! json_encode($finalImportMap) !!}
    }
    </script>
@endif

{{-- Stylesheets --}}
@foreach($bundle->css as $cssUrl)
    <link rel="stylesheet" href="{{ $cssUrl }}" crossorigin="anonymous" @if($nonce) nonce="{{ $nonce }}" @endif>
@endforeach

{{-- UMD scripts --}}
@php
    $umdAssets = array_filter($bundle->js, fn($js) => $js->type === \Mati365\CKEditor5Livewire\Cloud\Bundle\JSAssetType::UMD);
@endphp
@foreach($umdAssets as $asset)
    <script src="{{ $asset->url }}" @if($nonce) nonce="{{ $nonce }}" @endif></script>
@endforeach

{{-- Module preload for ESM assets --}}
@if($useImportMap)
    @foreach($esmAssets as $asset)
        <link rel="modulepreload" href="{{ $asset->url }}" crossorigin="anonymous" @if($nonce) nonce="{{ $nonce }}" @endif>
    @endforeach
@endif
