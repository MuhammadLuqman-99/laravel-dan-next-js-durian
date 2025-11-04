<?php

namespace App\Traits;

use App\Models\ActivityLog;

trait LogsActivity
{
    protected function logCreate($module, $record, $description = null)
    {
        $desc = $description ?? "Tambah {$module} baru";

        ActivityLog::logActivity(
            'create',
            $module,
            $record->id,
            $desc,
            null,
            $record->toArray()
        );
    }

    protected function logUpdate($module, $record, $oldData, $description = null)
    {
        $desc = $description ?? "Kemaskini {$module}";

        ActivityLog::logActivity(
            'update',
            $module,
            $record->id,
            $desc,
            $oldData,
            $record->fresh()->toArray()
        );
    }

    protected function logDelete($module, $record, $description = null)
    {
        $desc = $description ?? "Padam {$module}";

        ActivityLog::logActivity(
            'delete',
            $module,
            $record->id,
            $desc,
            $record->toArray(),
            null
        );
    }
}
